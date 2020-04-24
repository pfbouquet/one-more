function handleGameEvent(data) {
    switch (data.eventName) {
        case undefined:
            console.log("Game events need an eventName");
            break;
        case "Start":
            console.log("Launching game event " + data.eventName);
            break;
        default:
            console.log("Launching game event " + data.eventName);
            break;
    }
}
