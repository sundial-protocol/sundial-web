"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export default function RoadmapPage() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 }); // Mouse position relative to viewport
  const [scrollY, setScrollY] = useState(0); // Scroll position
  const animationFrameRef = useRef<number | null>(null);
  const sunPos = useRef({ x: 0, y: 0 }); // Sun position
  var mouseIsDown = false;
  var mouseIsDownDivision = false;

  function startMove() {
    mouseIsDown = true;
  }

  function stopMove() {
    mouseIsDown = false;
    mouseIsDownDivision = false;
    var sky = document.getElementById("sun");
  }

  // function updateDimensions() {
  //   if (typeof window.innerWidth == "number") {
  //     //Non-IE
  //     myWidth = window.innerWidth;
  //     myHeight = window.innerHeight;
  //   } else if (
  //     document.documentElement &&
  //     (document.documentElement.clientWidth ||
  //       document.documentElement.clientHeight)
  //   ) {
  //     myWidth = document.documentElement.clientWidth;
  //     myHeight = document.documentElement.clientHeight;
  //   } else if (
  //     document.body &&
  //     (document.body.clientWidth || document.body.clientHeight)
  //   ) {
  //     myWidth = document.body.clientWidth;
  //     myHeight = document.body.clientHeight;
  //   }
  // }

  function animateSunPosition() {
    const lerpFactor = 0.02; // Adjust this value for more or less delay
    const combinedY = mouse.y + scrollY; // Combine mouse position and scroll offset

    sunPos.current.x += (mouse.x - sunPos.current.x) * lerpFactor;
    sunPos.current.y += (combinedY - sunPos.current.y) * lerpFactor;

    const sun = document.getElementById("sun");
    const sunDay = document.getElementById("sunDay");
    const sunSet = document.getElementById("sunSet");
    const waterReflectionContainer = document.getElementById(
      "waterReflectionContainer"
    );
    const waterReflectionMiddle = document.getElementById(
      "waterReflectionMiddle"
    );
    const darknessOverlay = document.getElementById("darknessOverlay");
    const darknessOverlaySky = document.getElementById("darknessOverlaySky");
    const moon = document.getElementById("moon");
    const horizonNight = document.getElementById("horizonNight");
    const starsContainer = document.getElementById("starsContainer");
    const waterDistance = document.getElementById("waterDistance");
    const sky = document.getElementById("sky");
    const shadow = document.getElementById("shadow");
    const dial = document.getElementById("dial");

    const bodyWidth = document.body.clientWidth;
    const myHeight = window.innerHeight;
    const sunHeightPct = sunPos.current.y / myHeight;
    const sunXPct = sunPos.current.x / bodyWidth;

    if (shadow) {
      shadow.style.clipPath = `polygon(400px 0px, 500px 0px, ${
        975 - sunPos.current.x
      }px ${sunPos.current.y / 3}px)`;
      shadow.style.opacity = `${1 - sunHeightPct}`;
    }

    if (dial) {
      // Calculate gradient based on sun's position
      const ygradientStart = `rgba(255, 183, 11, 1) ${
        100 * (1 - sunHeightPct * (sunXPct ^ 2) * 0.5)
      }%`;

      const gradientEnd = `rgba(0, 0, 0, 0.7) 100%`;

      // Apply gradient to the dial
      dial.style.background = `linear-gradient(115deg, ${ygradientStart}, ${gradientEnd})`;
      // dial.style.clipPath = "polygon(100% 0%, 0% 100%, 100% 100%)"; // Ensure the gradient matches the triangle shape
    }

    if (sun) {
      const bitcoinLogo = document.getElementById("bitcoinLogo");
      if (bitcoinLogo) {
        bitcoinLogo.style.top = `${sunPos.current.y}px`;
        bitcoinLogo.style.left = `${sunPos.current.x}px`;
        bitcoinLogo.style.height = `${80 - sunHeightPct * 50}px`;
        bitcoinLogo.style.width = `${80 - sunHeightPct * 50}px`;
      }

      sun.style.background = `-webkit-radial-gradient(${sunPos.current.x}px ${sunPos.current.y}px, circle, rgba(242,248,247,1) 0%,rgba(249,249,28,1) 3%,rgba(247,214,46,1) 8%, rgba(248,200,95,1) 12%,rgba(201,165,132,1) 30%,rgba(115,130,133,1) 51%,rgba(46,97,122,1) 85%,rgba(24,75,106,1) 100%)`;
      sun.style.background = `-moz-radial-gradient(${sunPos.current.x}px ${sunPos.current.y}px, circle, rgba(242,248,247,1) 0%,rgba(249,249,28,1) 3%,rgba(247,214,46,1) 8%, rgba(248,200,95,1) 12%,rgba(201,165,132,1) 30%,rgba(115,130,133,1) 51%,rgba(46,97,122,1) 85%,rgba(24,75,106,1) 100%)`;
      sun.style.background = `-ms-radial-gradient(${sunPos.current.x}px ${sunPos.current.y}px, circle, rgba(242,248,247,1) 0%,rgba(249,249,28,1) 3%,rgba(247,214,46,1) 8%, rgba(248,200,95,1) 12%,rgba(201,165,132,1) 30%,rgba(115,130,133,1) 51%,rgba(46,97,122,1) 85%,rgba(24,75,106,1) 100%)`;
      sun.style.width = `${bodyWidth}px`;
      sun.style.left = "0px";
    }

    if (sunDay) {
      sunDay.style.background = `-webkit-radial-gradient(${sunPos.current.x}px ${sunPos.current.y}px, circle, rgba(252,255,251,0.9) 0%,rgba(253,250,219,0.4) 30%,rgba(226,219,197,0.01) 70%, rgba(226,219,197,0.0) 70%,rgba(201,165,132,0) 100%)`;
      sunDay.style.background = `-moz-radial-gradient(${sunPos.current.x}px ${sunPos.current.y}px, circle, rgba(252,255,251,0.9) 0%,rgba(253,250,219,0.4) 30%,rgba(226,219,197,0.01) 70%, rgba(226,219,197,0.0) 70%,rgba(201,165,132,0) 100%)`;
      sunDay.style.background = `-ms-radial-gradient(${sunPos.current.x}px ${sunPos.current.y}px, circle, rgba(252,255,251,0.9) 0%,rgba(253,250,219,0.4) 30%,rgba(226,219,197,0.01) 70%, rgba(226,219,197,0.0) 70%,rgba(201,165,132,0) 100%)`;
      sunDay.style.width = `${bodyWidth}px`;
      sunDay.style.left = "0px";
      sunDay.style.opacity = `${1 - sunHeightPct}`;
    }

    if (sunSet) {
      sunSet.style.background = `-webkit-radial-gradient(${sunPos.current.x}px ${sunPos.current.y}px, circle, rgba(254,255,255,0.8) 5%,rgba(236,255,0,1) 10%,rgba(253,50,41,1) 25%, rgba(243,0,0,1) 40%,rgba(93,0,0,1) 100%)`;
      sunSet.style.background = `-moz-radial-gradient(${sunPos.current.x}px ${sunPos.current.y}px, circle, rgba(254,255,255,0.8) 5%,rgba(236,255,0,1) 10%,rgba(253,50,41,1) 25%, rgba(243,0,0,1) 40%,rgba(93,0,0,1) 100%)`;
      sunSet.style.background = `-ms-radial-gradient(${sunPos.current.x}px ${sunPos.current.y}px, circle, rgba(254,255,255,0.8) 5%,rgba(236,255,0,1) 10%,rgba(253,50,41,1) 25%, rgba(243,0,0,1) 40%,rgba(93,0,0,1) 100%)`;
      sunSet.style.opacity = `${sunHeightPct - 0.2}`;
    }

    if (waterReflectionContainer) {
      waterReflectionContainer.style.perspectiveOrigin = `${
        (sunPos.current.x / bodyWidth) * 100
      }% -15%`;
    }

    if (waterReflectionMiddle) {
      waterReflectionMiddle.style.left = `${
        sunPos.current.x - bodyWidth - bodyWidth * 0.03
      }px`;
    }

    if (darknessOverlay) {
      darknessOverlay.style.opacity = `${Math.min(
        (sunPos.current.y - myHeight / 1.9) / (myHeight / 2),
        1
      )}`;
    }

    if (darknessOverlaySky) {
      darknessOverlaySky.style.opacity = `${Math.min(
        (sunPos.current.y - myHeight * 0.7) / (myHeight - myHeight * 0.7),
        1
      )}`;
    }

    if (moon) {
      moon.style.opacity = `${Math.min(
        (sunPos.current.y - myHeight * 0.9) / (myHeight - myHeight * 0.9),
        0.65
      )}`;
    }

    if (horizonNight) {
      horizonNight.style.opacity = `${
        (sunPos.current.y - myHeight * 0.8) / (myHeight - myHeight * 0.8)
      }`;
    }

    if (starsContainer) {
      starsContainer.style.opacity = `${sunHeightPct - 0.6}`;
    }

    if (waterDistance) {
      waterDistance.style.opacity = `${sunHeightPct + 0.6}`;
    }

    if (sky) {
      sky.style.opacity = `${Math.min(1 - sunHeightPct, 0.99)}`;
    }

    animationFrameRef.current = requestAnimationFrame(animateSunPosition);
  }

  useEffect(() => {
    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(animateSunPosition);
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mouse, scrollY]);

  function handleMouseMove(
    event: React.MouseEvent<HTMLDivElement> | React.WheelEvent<HTMLDivElement>
  ) {
    // if (!mouseIsDown) return;
    setMouse({
      x: event.clientX,
      y: event.clientY,
    });
  }

  return (
    <div
      className={styles.bodydiv + "flex flex-col min-h-screen"}
      onMouseMove={handleMouseMove}
      onScroll={handleMouseMove}
    >
      <div
        id="starsContainer"
        className={styles.starsContainer}
        onMouseDown={startMove}
        onMouseUp={stopMove}
      >
        <div
          id={styles.stars}
          onMouseDown={startMove}
          onMouseUp={stopMove}
        ></div>
      </div>

      <div id="sun" className={styles.sun}>
        <img
          id="bitcoinLogo"
          src="/bitcoin-btc-logo.svg"
          alt="Bitcoin Logo"
          className={styles.bitcoinLogo}
        />
      </div>

      <div
        id="sunDay"
        className={styles.sunDay}
        onMouseDown={startMove}
        onMouseUp={stopMove}
      ></div>

      <div
        id="sunSet"
        className={styles.sunSet}
        onMouseDown={startMove}
        onMouseUp={stopMove}
      ></div>

      <div
        id="sky"
        className={styles.sky}
        onMouseDown={startMove}
        onMouseUp={stopMove}
      ></div>

      <div className="star left-[250px] top-[30px]"></div>
      <div className="star left-[300px] top-[25px]"></div>
      <div className="star right-[40px] top-[40px]"></div>
      <div className="star right-[80px] top-[45px]"></div>
      <div className="star right-[120px] top-[20px]"></div>

      <div
        id="horizon"
        className={styles.horizon}
        onMouseDown={startMove}
        onMouseUp={stopMove}
      ></div>

      <div
        id="horizonNight"
        className={styles.horizonNight}
        onMouseDown={startMove}
        onMouseUp={stopMove}
      ></div>

      <div
        id="moon"
        className={styles.moon}
        onMouseDown={startMove}
        onMouseUp={stopMove}
      ></div>

      <div id="dialContainer" className={styles.dialContainer}>
        <div
          id="dial"
          className={styles.dial}
          onMouseDown={startMove}
          onMouseUp={stopMove}
        ></div>
      </div>

      <div
        id="shadow"
        className={styles.shadow}
        onMouseDown={startMove}
        onMouseUp={stopMove}
      ></div>

      <div
        id="water"
        className={styles.water}
        onMouseDown={startMove}
        onMouseUp={stopMove}
      >
        <div
          id="waterReflectionContainer"
          className={styles.waterReflectionContainer}
          onMouseDown={startMove}
          onMouseUp={stopMove}
        >
          <div
            id="waterReflectionMiddle"
            className={styles.waterReflectionMiddle}
            onMouseDown={startMove}
            onMouseUp={stopMove}
          ></div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-center text-white z-100 pt-24">
            Big things are on the horizon.
          </h1>
        </div>
      </div>
      <div
        id="waterDistance"
        className={styles.waterDistance}
        onMouseDown={startMove}
        onMouseUp={stopMove}
      ></div>
      <div
        id="darknessOverlaySky"
        className={styles.darknessOverlaySky}
        onMouseDown={startMove}
        onMouseUp={stopMove}
      ></div>
      <div id="darknessOverlay" className={styles.darknessOverlay}>
        <div className="text-xl font-bold text-center text-primary z-100 pt-12 space-y-8">
          <h1 className="text-4xl font-bold text-center text-primary z-100">
            Join us on our journey to the moon.
          </h1>
          <li>Phase 1: Incentivized Testnet</li>
          <li>Phase 2: IPO</li>
          <li>Phase 3: Mainnet Launch</li>
          <li>More to come... </li>
        </div>
      </div>
      <div
        id="oceanRippleContainer"
        className={styles.oceanRippleContainer}
      ></div>
      <div id="oceanRipple" className={styles.oceanRipple}></div>
    </div>
  );
}
