// Needle animation logic for galvanometers
document.addEventListener('DOMContentLoaded', () => {
    const needleL = document.getElementById('needle-l');
    const needleR = document.getElementById('needle-r');

    setInterval(() => {
        // Randomize angle between -45 and 45 degrees
        const newAngleL = (Math.random() * 90) - 45;
        const newAngleR = (Math.random() * 90) - 45;

        if (needleL) needleL.style.transform = `rotate(${newAngleL}deg)`;
        if (needleR) needleR.style.transform = `rotate(${newAngleR}deg)`;
    }, 150); // Update every 150ms
});