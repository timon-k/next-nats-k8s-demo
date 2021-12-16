import { ReactElement } from "react";
import EventDisplay from "../components/EventDisplay";

export default function HomePage(): ReactElement {
    return (
        <div>
            <h1>Messages</h1>
            <EventDisplay />
        </div>
    );
}
