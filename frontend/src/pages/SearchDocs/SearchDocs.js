import { useEffect, useRef, useState } from "react";
import { recommendDoctors } from "./utils/recommendations";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { gapi } from "gapi-script";
import Navbar from "../../components/Navbar/Navbar";

const API_TOKEN =
  "pk.eyJ1IjoibWFuYW4xNyIsImEiOiJjbGF0N3pkMGgxdnBhM25udmhuZmVwdzRyIn0.roV1T7xiEcFCXMjCkYJxsg";
mapboxgl.accessToken = API_TOKEN;

function SearchDocs() {
  const [diagnosis, setDiagnosis] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const mapContainer = useRef(null);
  const map = useRef(null);
  useEffect(() => {
    // const diag = blackBoxDiagnosis();
    // setDiagnosis(diag);
    // setDoctors(recommendDoctors(diag, 5));
    getDiagnosis();
  }, []);
  const getDiagnosis = async () => {
    try {
      const response = await fetch("http://localhost:3000/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("DIAGNOSIS: ", data);
      setDiagnosis(data.diagnosis);
      setDoctors(recommendDoctors(data.diagnosis, 5));
    } catch (error) {
      console.error("Error fetching diagnosis:", error);
    }
  };
  useEffect(() => {
    function initClient() {
      gapi.client.init({
        apiKey: "AIzaSyDmWFUmhkQn56BNpA7P07ctwEEN2oIy17g",
        clientId:
          "617197049821-p0ln73afjkhcp0dqi3n4jeo8h77hi657.apps.googleusercontent.com",
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        ],
        scope: "https://www.googleapis.com/auth/calendar",
        // ux_mode: "redirect",
        // redirect_uri: "http://localhost:3001/",
      });
    }
    gapi.load("client:auth2", initClient);
  }, []);
  useEffect(() => {
    if (doctors?.length && mapContainer.current && !map.current) {
      const { longitude, latitude } = doctors[0];
      console.log(doctors[0]);
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [longitude, latitude],
        zoom: 10,
      });

      // Add markers for each doctor
      doctors.forEach((doc) => {
        const marker = new mapboxgl.Marker({ color: "#115E59" })
          .setLngLat([doc.longitude, doc.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<strong>Dr. ${doc.Name}</strong><br/>${doc.Clinic}`
            )
          )
          .addTo(map.current);
      });
    }
  }, [doctors, diagnosis]);
  const handleBookMeeting = async (doctor) => {
    try {
      await gapi.auth2.getAuthInstance().signIn();
      const today = new Date();
      const day = today.getDay(); // 0-6
      const diffToMon = (1 - day + 7) % 7 || 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + diffToMon);
      const nextFriday = new Date(nextMonday);
      nextFriday.setDate(nextMonday.getDate() + 4);
      const startWindow = new Date(nextMonday);
      startWindow.setHours(9, 0, 0, 0);
      const endWindow = new Date(nextFriday);
      endWindow.setHours(17, 0, 0, 0);
      const fbResponse = await gapi.client.calendar.freebusy.query({
        resource: {
          timeMin: startWindow.toISOString(),
          timeMax: endWindow.toISOString(),
          items: [{ id: "manans170602@gmail.com" }, { id: "mshah131@asu.edu" }],
        },
      });
      const busyTimes = [
        ...fbResponse.result.calendars["manans170602@gmail.com"].busy,
        ...fbResponse.result.calendars["mshah131@asu.edu"].busy,
      ];
      const findSlot = () => {
        const slot = new Date(startWindow);
        while (slot < endWindow) {
          const slotEnd = new Date(slot);
          slotEnd.setHours(slot.getHours() + 1);
          const conflict = busyTimes.some(
            (bt) => new Date(bt.start) < slotEnd && new Date(bt.end) > slot
          );
          if (!conflict) return { start: new Date(slot), end: slotEnd };
          slot.setHours(slot.getHours() + 1);
        }
        return null;
      };
      const slot = findSlot();
      if (!slot) {
        alert("No available slots this week between 9am-5pm.");
        return;
      }
      const event = {
        summary: `Appointment with Dr. ${doctor.Name}`,
        start: { dateTime: slot.start.toISOString() },
        end: { dateTime: slot.end.toISOString() },
        attendees: [
          { email: "manans170602@gmail.com" },
          { email: "mshah131@asu.edu" },
        ],
      };
      await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });
      alert(`Booked appointment on ${slot.start.toLocaleString()}`);
    } catch (error) {
      console.error(error);
      alert("Error booking appointment");
    }
  };

  if (!diagnosis) return <p>Loading recommendation…</p>;
  const columns = [
    "Name",
    "Specialties",
    "Address",
    "Clinic",
    "Email",
    "Phone",
    "Rating",
  ];

  return (
    <div className="flex">
      <Navbar />
      <div className="p-6 bg-sky-50 h-screen rounded-lg shadow-md ">
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: "#115E59" }}
        >
          Patient Diagnosis: <em>{diagnosis}</em>
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr style={{ backgroundColor: "#115E59" }}>
                {columns?.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2 text-left text-sm font-medium text-white uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
                <th className="px-4 py-2 text-left text-sm font-medium text-white uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors?.map((doc, i) => (
                <tr key={i} className="even:bg-teal-100">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2 text-sm text-gray-700">
                      {doc[col]}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleBookMeeting(doc)}
                      className="px-4 py-2 bg-[#115E59] text-white text-sm font-medium rounded hover:bg-[#5A5A5A] transition"
                    >
                      Book Meet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          ref={mapContainer}
          className="w-full mt-4 h-96 mb-6 rounded-lg shadow-inner"
        />
      </div>
    </div>
  );
}

export default SearchDocs;
