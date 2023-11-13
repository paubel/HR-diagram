let container = d3.select("#hr-diagram");
let width = parseInt(container.style("width"));
let height = parseInt(container.style("height"));

/* const width = 800;
const height = 600; */
const margin = { top: 20, right: 20, bottom: 40, left: 60 };

const svg = d3
  .select("#hr-diagram")
  .attr("width", width)
  .attr("height", height);

// Real star data for the Orion constellation, including radius (in solar radii), luminosity, and temperature
const stars = [
  {
    temperature: 27960,
    luminosity: 537000,
    name: "Alnilam",
    spectralClass: "B0 Ia",
    radius: 32.4,
  },
  {
    temperature: 33000,
    luminosity: 250000,
    name: "Alnitak (Aa)",
    spectralClass: "O9.5Iab",
    radius: 20.0,
  },
  {
    temperature: 26000,
    luminosity: 32000,
    name: "Alnitak (Ab)",
    spectralClass: "B1IV",
    radius: 7.3,
  },

  {
    temperature: 21000,
    luminosity: 9211,
    name: "Bellatrix",
    spectralClass: "B2 V (B2 III)",
    radius: 7.75,
  },
  {
    temperature: 3500,
    luminosity: 7600,
    name: "Betelgeuse",
    spectralClass: "M1–M2 Ia–ab",
    radius: 887.0,
  },
  {
    temperature: 33000,
    luminosity: 68000,
    name: "Hatysa (Aa1)",
    spectralClass: "O9 III",
    radius: 8.3,
  },
  {
    temperature: 26000,
    luminosity: 8630,
    name: "Hatysa (Aa2)",
    spectralClass: "B0.8 III/IV",
    radius: 5.4,
  },

  {
    temperature: 32000,
    luminosity: 190000,
    name: "Mintaka (Aa1)",
    spectralClass: "O9.5II",
    radius: 16.5,
  },
  {
    temperature: 26000,
    luminosity: 63000,
    name: "Mintaka (Ab)",
    spectralClass: "B0IV",
    radius: 10.4,
  },
  {
    temperature: 30000,
    luminosity: 16000,
    name: "Mintaka (Aa2)",
    spectralClass: "B1V",
    radius: 6.5,
  },
  {
    temperature: 29000,
    luminosity: 3300,
    name: "Mintaka (HD 36485)",
    spectralClass: "B3V",
    radius: 5.7,
  },

  {
    temperature: 26000,
    luminosity: 61500,
    name: "Rigel (A)",
    spectralClass: "B8Ia",
    radius: 78.9,
  },

  {
    temperature: 27000,
    luminosity: 56881,
    name: "Saiph",
    spectralClass: "B0.5 Ia",
    radius: 22.2,
  },
];

// Define scales for temperature, luminosity, and radius (logarithmic)
const xScale = d3
  .scaleLinear()
  .domain([40000, 0])
  .range([margin.left, width - margin.right]);

const yScale = d3
  .scaleLog()
  .domain([0.1, 10000000])
  .range([height - margin.bottom, margin.top]);

const radiusScale = d3.scaleLog().domain([0.01, 1000]).range([2, 20]);

// Color scale based on temperature (spectral class)
var colors = [
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
var temps = [
  2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 14000, 20000, 30000,
];
var colorScale = d3.scaleLinear().domain(temps).range(colors);

// Create circles for stars on the HR diagram with radii based on the star size and colored by temperature
svg
  .selectAll("circle")
  .data(stars)
  .enter()
  .append("circle")
  .attr("cx", (d) => xScale(d.temperature))
  .attr("cy", (d) => yScale(d.luminosity))
  .attr("r", (d) => radiusScale(d.radius))
  .style("fill", (d) => colorScale(d.temperature));

// Add labels to stars
svg
  .selectAll("text")
  .data(stars)
  .enter()
  .append("text")
  .attr("x", (d) => xScale(d.temperature) + 10)
  .attr("y", (d) => yScale(d.luminosity))
  .text((d) => d.name)
  .style("font-size", "15px") // Increase the font size
  .style("fill", "#fff") // Change the font color to white
  .style("text-shadow", "2px 2px 4px #000"); // Add a black text shadow
// Add x-axis
const xAxis = d3.axisBottom(xScale).ticks(5, "s");
svg
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height - margin.bottom})`)
  .call(xAxis);

// Add y-axis
const yAxis = d3.axisLeft(yScale).ticks(5, "s");
svg
  .append("g")
  .attr("class", "y-axis")
  .attr("transform", `translate(${margin.left}, 0)`)
  .call(yAxis);

// Add x-axis label
svg
  .append("text")
  .attr("class", "x-label")
  .attr("x", width / 2)
  .attr("y", height - 10)
  .style("text-anchor", "middle")
  .text("Temperature (K)");

// Add y-axis label
svg
  .append("text")
  .attr("x", -height / 2)
  .attr("y", 10)
  .attr("transform", "rotate(-90)")
  .style("text-anchor", "middle")
  .text("Luminosity (Solar Units)");

window.addEventListener("resize", () => {
  width = parseInt(container.style("width"));
  height = parseInt(container.style("height"));

  // Update the position of the x-axis label
  svg
    .select(".x-label")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom + 20);

  // Update the viewBox of the SVG
  svg.attr("viewBox", `0 0 ${width} ${height}`);

  // Update the scales
  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, margin.top]);

  // Redraw the axes
  svg
    .select(".x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  svg.select(".y-axis").call(d3.axisLeft(yScale));

  // Update the positions of the circles
  svg
    .selectAll("circle")
    .attr("cx", (d) => xScale(d.temperature))
    .attr("cy", (d) => yScale(d.luminosity));

  // Update the positions of the text labels
  svg
    .selectAll("text")
    .attr("x", (d) => xScale(d.temperature))
    .attr("y", (d) => yScale(d.luminosity));
});

// Create a div for the tooltip and style it
var tooltip = d3
  .select("body")
  .append("div")
  .style("position", "absolute")
  .style("background", "#fff")
  .style("padding", "5px")
  .style("border", "1px solid #000")
  .style("border-radius", "5px")
  .style("pointer-events", "none") // to prevent the tooltip from interfering with mouse events
  .style("display", "none");

// Add mouseover, mousemove, and mouseout event listeners to the circles
svg
  .selectAll("circle")
  .on("mouseover", (event, d) => {
    // Show the tooltip and set its text
    tooltip.style("display", "block");
    tooltip.html(
      `Temperature: ${d.temperature} K <br>Luminosity: ${d.luminosity} L☉)`
    );
  })
  .on("mousemove", (event) => {
    // Update the position of the tooltip
    tooltip.style("left", event.pageX + 10 + "px");
    tooltip.style("top", event.pageY - 10 + "px");
  })
  .on("mouseout", () => {
    // Hide the tooltip
    tooltip.style("display", "none");
  });
