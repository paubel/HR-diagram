const container = d3.select("#hr-diagram");
let width = container.node().getBoundingClientRect().width || window.innerWidth;
let height =
  container.node().getBoundingClientRect().height || window.innerHeight;
const margin = { top: 20, right: 20, bottom: 40, left: 60 };

const svg = d3
  .select("#hr-diagram")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

const tooltip = d3
  .select("body")
  .append("div")
  .style("position", "absolute")
  .style("background", "#ebebeb")
  .style("padding", "5px")
  .style("border", "1px solid #121212")
  .style("border-radius", "5px")
  .style("pointer-events", "none")
  .style("display", "none")
  .style("color", "black");

// Scales
const xScale = d3
  .scaleLinear()
  .domain([40000, 1100])
  .range([margin.left, width - margin.right]);

const yScale = d3
  .scaleLog()
  .domain([0.00007, 6000000])
  .range([height - margin.bottom, margin.top]);

const radiusScale = d3.scaleLog().domain([0.0003, 1000]).range([0.8, 16]);

const colors = [
  "#FB1108",
  "#FD150B",
  "#FA7806",
  "#FBE426",
  "#FCFB8F",
  "#F3F5E7",
  "#C7E4EA",
  "#ABD6E6",
  "#9AD2E1",
  "#42A1C1",
  "#1C5FA5",
  "#172484",
];
const temps = [
  2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 14000, 20000, 30000,
];
const colorScale = d3.scaleLinear().domain(temps).range(colors);

// Controls
const tempMinInput = document.getElementById("temp-min");
const tempMaxInput = document.getElementById("temp-max");
const tempTrack = document.querySelector(".temp-track");
const tempMinVal = document.getElementById("temp-min-val");
const tempMaxVal = document.getElementById("temp-max-val");
const distMinInput = document.getElementById("dist-min");
const distMaxInput = document.getElementById("dist-max");
const distTrack = document.querySelector(".dist-track");
const distMinVal = document.getElementById("dist-min-val");
const distMaxVal = document.getElementById("dist-max-val");
const magMinInput = document.getElementById("mag-min");
const magMaxInput = document.getElementById("mag-max");
const magTrack = document.querySelector(".mag-track");
const magMinVal = document.getElementById("mag-min-val");
const magMaxVal = document.getElementById("mag-max-val");
const radMinInput = document.getElementById("rad-min");
const radMaxInput = document.getElementById("rad-max");
const radTrack = document.querySelector(".rad-track");
const radMinVal = document.getElementById("rad-min-val");
const radMaxVal = document.getElementById("rad-max-val");
const namesToggle = document.getElementById("names-toggle");
const declutterToggle = document.getElementById("declutter-toggle");
const haloToggle = document.getElementById("halo-toggle");
const resetBtn = document.getElementById("reset-filters");
const chipButtons = d3.selectAll(".chips button");
const panel = document.querySelector(".control-card");
const panelToggle = document.getElementById("panel-toggle");
let panelVisible = true;

chipButtons.classed("active", true);

const allTypes = new Set([
  "main sequence",
  "giant",
  "supergiant",
  "hypergiant",
  "white dwarf",
  "red dwarf",
]);

const allSpectral = new Set(["O", "B", "A", "F", "G", "K", "M", "L", "D"]);

const filterState = {
  temp: [1100, 40000],
  dist: [0, 4.3],
  mag: [-27, 28],
  radiusLog: [-4, 3],
  types: new Set(allTypes),
  spectral: new Set(allSpectral),
  declutter: false,
  halo: false,
  showNames: true,
};

let allStars = [];

// Locale formatter with spaces
const formatLocale = d3
  .formatLocale({
    decimal: ".",
    thousands: " ",
    grouping: [3],
    currency: ["", ""],
  })
  .format(",");

const xAxis = d3
  .axisBottom(xScale)
  .ticks(10, "d")
  .tickFormat((d) => (d < 1 ? d3.format(".3f")(d) : formatLocale(d)));

const yAxis = d3
  .axisLeft(yScale)
  .ticks(10, "d")
  .tickFormat((d) =>
    d < 1 ? parseFloat(d3.format(".3f")(d)) : formatLocale(d)
  );

// Axes and labels
const xAxisGroup = svg
  .append("g")
  .attr("class", "x-axis")
  .attr(
    "transform",
    `translate(${margin.left - 60}, ${height - margin.bottom + 23})`
  )
  .call(xAxis);

xAxisGroup
  .selectAll(".tick")
  .append("line")
  .classed("grid-line", true)
  .attr("y1", 0)
  .attr("y2", -height);

const yAxisGroup = svg
  .append("g")
  .attr("class", "y-axis")
  .attr("transform", `translate(${margin.left - 31}, 0)`)
  .call(yAxis)
  .selectAll("text")
  .attr("transform", "rotate(-60)")
  .style("text-anchor", "end");

svg
  .selectAll(".y-axis .tick")
  .append("line")
  .classed("grid-line", true)
  .attr("x1", 0)
  .attr("x2", width);

svg
  .append("text")
  .attr("class", "x-label")
  .attr("x", width / 2)
  .attr("y", height - 30)
  .style("text-anchor", "middle")
  .text("Temperature (K)");

svg
  .append("text")
  .attr("class", "y-label")
  .attr("x", -height / 2 - 20)
  .attr("y", 55)
  .attr("transform", "rotate(-90)")
  .style("text-anchor", "middle")
  .text("Luminosity (L⊙)");

svg
  .append("text")
  .attr("class", "headline")
  .attr("x", margin.left + 110)
  .attr("y", height - margin.bottom - 90)
  .attr("text-anchor", "middle")
  .style("font-size", "24px")
  .text("H-R Diagram");

svg
  .append("text")
  .attr("class", "creator-name")
  .attr("x", margin.left + 240)
  .attr("y", height - margin.bottom - 90)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .text("by Paul Belfrage");

svg
  .append("text")
  .style("font-size", "11px")
  .attr("class", "number-of-stars")
  .attr("x", margin.left + 110)
  .attr("y", height - margin.bottom - 70)
  .attr("text-anchor", "middle")
  .text("");

// Sun pointer
const defs = svg.append("defs");
defs
  .append("marker")
  .attr("id", "sun-arrow")
  .attr("markerWidth", 12)
  .attr("markerHeight", 12)
  .attr("refX", 6)
  .attr("refY", 6)
  .attr("orient", "auto")
  .attr("markerUnits", "strokeWidth")
  .append("path")
  .attr("d", "M0,0 L12,6 L0,12 L3,6 z")
  .attr("fill", "#00ff00");

const pointer = svg.append("g").attr("class", "sun-pointer");
pointer.append("line").attr("class", "sun-pointer-line");
pointer.append("text").attr("class", "sun-pointer-label");

function updateSunPointer() {
  const sunSel = svg
    .selectAll("circle.star")
    .filter((d) => d && /sol|sun/i.test(d.name));
  if (sunSel.empty()) {
    pointer.style("display", "none");
    return;
  }
  const sunDatum = sunSel.datum();
  const x = xScale(sunDatum.temperature);
  const y = yScale(sunDatum.luminosity);
  const r = radiusScale(sunDatum.radius) || 3;
  const tailOffset = Math.max(40, r * 6);
  const tailX = x - tailOffset - 20;
  const tailY = y - tailOffset / 2 - 10;

  pointer.style("display", null);
  pointer
    .select(".sun-pointer-line")
    .attr("x1", tailX)
    .attr("y1", tailY)
    .attr("x2", x - r - 2)
    .attr("y2", y)
    .attr("stroke", "#00ff00")
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#sun-arrow)");

  pointer
    .select(".sun-pointer-label")
    .attr("x", tailX - 12)
    .attr("y", tailY - 10)
    .text(sunDatum.name || "Sun")
    .attr("fill", "#00ff00")
    .style("font-size", "12px")
    .style("font-weight", "700");
}

function formatValue(val) {
  return val.toLocaleString("en-US", { useGrouping: true }).replace(/,/g, " ");
}

function formatMaybe(val, suffix = "") {
  return val || val === 0 ? `${formatValue(val)}${suffix}` : "N/A";
}

function updateTempTrack(tMin, tMax) {
  if (!tempTrack) return;
  const min = Number(tempMinInput.min);
  const max = Number(tempMinInput.max);
  const start = ((tMin - min) / (max - min)) * 100;
  const end = ((tMax - min) / (max - min)) * 100;
  const left = Math.min(start, end);
  const width = Math.abs(end - start);
  tempTrack.style.left = `${left}%`;
  tempTrack.style.width = `${width}%`;
}

function updateDistTrack(dMin, dMax) {
  if (!distTrack) return;
  const min = Number(distMinInput.min);
  const max = Number(distMinInput.max);
  const start = ((dMin - min) / (max - min)) * 100;
  const end = ((dMax - min) / (max - min)) * 100;
  const left = Math.min(start, end);
  const width = Math.abs(end - start);
  distTrack.style.left = `${left}%`;
  distTrack.style.width = `${width}%`;
}

function updateMagTrack(mMin, mMax) {
  if (!magTrack) return;
  const min = Number(magMinInput.min);
  const max = Number(magMinInput.max);
  const start = ((mMin - min) / (max - min)) * 100;
  const end = ((mMax - min) / (max - min)) * 100;
  const left = Math.min(start, end);
  const width = Math.abs(end - start);
  magTrack.style.left = `${left}%`;
  magTrack.style.width = `${width}%`;
}

function updateRadTrack(rMin, rMax) {
  if (!radTrack) return;
  const min = Number(radMinInput.min);
  const max = Number(radMinInput.max);
  const start = ((rMin - min) / (max - min)) * 100;
  const end = ((rMax - min) / (max - min)) * 100;
  const left = Math.min(start, end);
  const width = Math.abs(end - start);
  radTrack.style.left = `${left}%`;
  radTrack.style.width = `${width}%`;
}

function declutterLabels(selection) {
  const seen = [];
  selection.each(function () {
    const node = this.getBBox();
    const overlap = seen.some(
      (b) =>
        !(
          node.x + node.width < b.x ||
          node.x > b.x + b.width ||
          node.y + node.height < b.y ||
          node.y > b.y + b.height
        )
    );
    if (overlap) {
      this.classList.add("hidden");
    } else {
      this.classList.remove("hidden");
      seen.push(node);
    }
  });
}

function updateLabelVisibility() {
  const labels = svg.selectAll(".star-label");
  labels.classed("hidden", !filterState.showNames);
  if (filterState.showNames && filterState.declutter) {
    declutterLabels(labels);
  } else if (filterState.showNames && !filterState.declutter) {
    labels.classed("hidden", false);
  }
}

function neighborHighlight(target) {
  if (!filterState.halo) return;
  const circles = svg.selectAll("circle.star");
  circles.classed("halo", (d) => {
    if (!d) return false;
    const dT = Math.abs(
      Math.log10(d.temperature) - Math.log10(target.temperature)
    );
    const dL = Math.abs(
      Math.log10(d.luminosity) - Math.log10(target.luminosity)
    );
    return dT < 0.12 && dL < 0.35;
  });
}

function clearHighlight() {
  svg.selectAll("circle.star").classed("halo", false);
}

function render(stars) {
  const circles = svg.selectAll("circle.star").data(stars, (d) => d.name);
  circles.exit().remove();

  const entered = circles.enter().append("circle").attr("class", "star");

  entered
    .merge(circles)
    .attr("cx", (d) => xScale(d.temperature))
    .attr("cy", (d) => yScale(d.luminosity))
    .attr("r", (d) => radiusScale(d.radius))
    .style("fill", (d) => colorScale(d.temperature))
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block");
      tooltip.html(`
        <strong>${d.name}</strong><br>
        Type: ${d.type}<br>
        Constellation: ${d.constellation}<br>
        Temperature: ${formatMaybe(d.temperature, " K")}<br>
        Luminosity: ${formatMaybe(d.luminosity, " L⊙")}<br>
        Radius: ${formatMaybe(d.radius, " R⊙")}<br>
        Apparent Magnitude: ${formatMaybe(d.apparentMagnitude)}<br>
        Distance: ${formatMaybe(d.distance, " ly")}<br>
        Age: ${formatMaybe(d.age, " y")}<br>
        Mass: ${formatMaybe(d.mass, " M⊙")}
      `);
      neighborHighlight(d);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", event.pageX + 1 + "px")
        .style("top", event.pageY - 1 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
      clearHighlight();
    });

  const labels = svg.selectAll("text.star-label").data(stars, (d) => d.name);
  labels.exit().remove();

  labels
    .enter()
    .append("text")
    .attr("class", "star-label")
    .merge(labels)
    .attr("x", (d) => xScale(d.temperature) + 10)
    .attr("y", (d) => yScale(d.luminosity))
    .text((d) => d.name)
    .style("font-size", "11px")
    .style("fill", "#f2f2f2")
    .style("text-shadow", "2px 2px 4px #000");

  updateLabelVisibility();
  updateSunPointer();
  svg.select(".number-of-stars").text(`${stars.length} stars shown`);
}

function applyFilters() {
  const [tempMin, tempMax] = filterState.temp;
  const [distMinLog, distMaxLog] = filterState.dist;
  const distMin = Math.pow(10, distMinLog);
  const distMax = Math.pow(10, distMaxLog);
  const [magMin, magMax] = filterState.mag;
  const [radMinLog, radMaxLog] = filterState.radiusLog;
  const radiusMin = Math.pow(10, radMinLog);
  const radiusMax = Math.pow(10, radMaxLog);

  const filtered = allStars.filter((star) => {
    const tempOk = star.temperature >= tempMin && star.temperature <= tempMax;
    const distOk = star.distance
      ? star.distance >= distMin && star.distance <= distMax
      : true;
    const magOk = star.apparentMagnitude
      ? star.apparentMagnitude >= magMin && star.apparentMagnitude <= magMax
      : true;
    const radiusOk = star.radius
      ? star.radius >= radiusMin && star.radius <= radiusMax
      : true;
    const typeOk =
      filterState.types.size === 0 ||
      filterState.types.has((star.type || "").toLowerCase());
    const spectralClass = (star.spectralClass || "").charAt(0).toUpperCase();
    const spectralOk =
      filterState.spectral.size === 0 ||
      filterState.spectral.has(spectralClass);
    return tempOk && distOk && magOk && radiusOk && typeOk && spectralOk;
  });

  render(filtered);
}

function syncTemperature() {
  const rawMin = Number(tempMinInput.value);
  const rawMax = Number(tempMaxInput.value);
  const tMin = Math.min(rawMin, rawMax);
  const tMax = Math.max(rawMin, rawMax);
  tempMinInput.value = tMin;
  tempMaxInput.value = tMax;
  filterState.temp = [tMin, tMax];
  tempMinVal.textContent = formatValue(tMin);
  tempMaxVal.textContent = formatValue(tMax);
  updateTempTrack(tMin, tMax);
}

function syncRadius() {
  const rawMin = Number(radMinInput.value);
  const rawMax = Number(radMaxInput.value);
  const rMin = Math.min(rawMin, rawMax);
  const rMax = Math.max(rawMin, rawMax);
  radMinInput.value = rMin;
  radMaxInput.value = rMax;
  filterState.radiusLog = [rMin, rMax];
  radMinVal.textContent = formatValue(parseFloat(Math.pow(10, rMin).toPrecision(3)));
  radMaxVal.textContent = formatValue(parseFloat(Math.pow(10, rMax).toPrecision(3)));
  updateRadTrack(rMin, rMax);
}

function syncDistance() {
  const rawMin = Number(distMinInput.value);
  const rawMax = Number(distMaxInput.value);
  const dMin = Math.min(rawMin, rawMax);
  const dMax = Math.max(rawMin, rawMax);
  distMinInput.value = dMin;
  distMaxInput.value = dMax;
  filterState.dist = [dMin, dMax];
  distMinVal.textContent = formatValue(Math.round(Math.pow(10, dMin)));
  distMaxVal.textContent = formatValue(Math.round(Math.pow(10, dMax)));
  updateDistTrack(dMin, dMax);
}

function syncMagnitude() {
  const rawMin = Number(magMinInput.value);
  const rawMax = Number(magMaxInput.value);
  const mMin = Math.min(rawMin, rawMax);
  const mMax = Math.max(rawMin, rawMax);
  magMinInput.value = mMin;
  magMaxInput.value = mMax;
  filterState.mag = [mMin, mMax];
  magMinVal.textContent = mMin.toFixed(1);
  magMaxVal.textContent = mMax.toFixed(1);
  updateMagTrack(mMin, mMax);
}

function resetControls() {
  filterState.temp = [1100, 40000];
  filterState.dist = [0, 4.3];
  filterState.mag = [-27, 28];
  filterState.radiusLog = [-4, 3];
  filterState.types = new Set(allTypes);
  filterState.spectral = new Set(allSpectral);
  filterState.declutter = false;
  filterState.halo = false;
  filterState.showNames = true;

  tempMinInput.value = 1100;
  tempMaxInput.value = 40000;
  tempMinVal.textContent = "1 100";
  tempMaxVal.textContent = "40 000";
  updateTempTrack(1100, 40000);
  distMinInput.value = 0;
  distMaxInput.value = 4.3;
  distMinVal.textContent = "1";
  distMaxVal.textContent = "200 000";
  updateDistTrack(0, 4.3);
  magMinInput.value = -27;
  magMaxInput.value = 28;
  magMinVal.textContent = "-27.0";
  magMaxVal.textContent = "28.0";
  updateMagTrack(-27, 28);
  radMinInput.value = -4;
  radMaxInput.value = 3;
  radMinVal.textContent = "0.0001";
  radMaxVal.textContent = "1 000";
  updateRadTrack(-4, 3);
  namesToggle.checked = true;
  declutterToggle.checked = false;
  haloToggle.checked = false;
  chipButtons.classed("active", true);
  applyFilters();
}

d3.json("stars-sort.json").then((stars) => {
  allStars = stars;
  syncTemperature();
  syncDistance();
  syncMagnitude();
  syncRadius();
  render(stars);
});

tempMinInput.addEventListener("input", () => {
  syncTemperature();
  applyFilters();
});

tempMaxInput.addEventListener("input", () => {
  syncTemperature();
  applyFilters();
});

distMinInput.addEventListener("input", () => {
  syncDistance();
  applyFilters();
});

distMaxInput.addEventListener("input", () => {
  syncDistance();
  applyFilters();
});

magMinInput.addEventListener("input", () => {
  syncMagnitude();
  applyFilters();
});

magMaxInput.addEventListener("input", () => {
  syncMagnitude();
  applyFilters();
});

radMinInput.addEventListener("input", () => {
  syncRadius();
  applyFilters();
});

radMaxInput.addEventListener("input", () => {
  syncRadius();
  applyFilters();
});

namesToggle.addEventListener("change", (e) => {
  filterState.showNames = e.target.checked;
  updateLabelVisibility();
});

declutterToggle.addEventListener("change", (e) => {
  filterState.declutter = e.target.checked;
  updateLabelVisibility();
});

haloToggle.addEventListener("change", (e) => {
  filterState.halo = e.target.checked;
  if (!e.target.checked) clearHighlight();
});

resetBtn.addEventListener("click", resetControls);

panelToggle.addEventListener("click", () => {
  panelVisible = !panelVisible;
  panel.classList.toggle("hidden", !panelVisible);
  panelToggle.textContent = panelVisible ? "Hide panel" : "Show panel";
  panelToggle.setAttribute("aria-expanded", panelVisible ? "true" : "false");
});

chipButtons.on("click", function () {
  const btn = d3.select(this);
  btn.classed("active", !btn.classed("active"));

  // Rebuild active sets from DOM to avoid drift
  const activeTypes = new Set();
  d3.selectAll('button[data-type].active').each(function () {
    const key = d3.select(this).attr("data-type").toLowerCase();
    activeTypes.add(key);
  });
  const activeSpectral = new Set();
  d3.selectAll('button[data-spectral].active').each(function () {
    activeSpectral.add(d3.select(this).attr("data-spectral"));
  });
  filterState.types = activeTypes;
  filterState.spectral = activeSpectral;

  applyFilters();
});

window.addEventListener("resize", () => {
  width = container.node().getBoundingClientRect().width || window.innerWidth;
  height =
    container.node().getBoundingClientRect().height || window.innerHeight;

  svg.attr("viewBox", `0 0 ${width} ${height}`);

  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, margin.top]);

  svg
    .select(".x-axis")
    .attr(
      "transform",
      `translate(${margin.left - 60}, ${height - margin.bottom + 23})`
    )
    .call(xAxis);

  svg.select(".y-axis").call(yAxis);
  svg
    .selectAll(".y-axis text")
    .attr("transform", "rotate(-60)")
    .style("text-anchor", "end");

  svg
    .select(".x-label")
    .attr("x", width / 2)
    .attr("y", height - 30);

  svg.select(".y-label").attr("x", -height / 2 - 20);
  svg
    .select(".headline")
    .attr("x", margin.left + 110)
    .attr("y", height - margin.bottom - 90);
  svg
    .select(".number-of-stars")
    .attr("x", margin.left + 110)
    .attr("y", height - margin.bottom - 70);
  svg
    .select(".creator-name")
    .attr("x", margin.left + 240)
    .attr("y", height - margin.bottom - 90);

  svg
    .selectAll("circle.star")
    .attr("cx", (d) => xScale(d.temperature))
    .attr("cy", (d) => yScale(d.luminosity));

  svg
    .selectAll(".star-label")
    .attr("x", (d) => xScale(d.temperature) + 10)
    .attr("y", (d) => yScale(d.luminosity));

  updateLabelVisibility();
  updateSunPointer();
});
