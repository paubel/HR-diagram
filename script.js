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

// Create a div for the tooltip and style it
let tooltip = d3
  .select("body")
  .append("div")
  .style("position", "absolute")
  .style("background", "#fff")
  .style("padding", "5px")
  .style("border", "1px solid #000")
  .style("border-radius", "5px")
  .style("pointer-events", "none") // to prevent the tooltip from interfering with mouse events
  .style("display", "none")
  .style("color", "black");

// Define scales for temperature, luminosity, and radius (logarithmic)
const xScale = d3
  .scaleLinear()
  .domain([40000, 0])
  .range([margin.left, width - margin.right]);

const yScale = d3
  .scaleLog()
  .domain([0.00001, 10000000])
  .range([height - margin.bottom, margin.top]);

//const radiusScale = d3.scaleLog().domain([0.01, 1000]).range([2, 20]); // Original
const radiusScale = d3.scaleLog().domain([0.1, 100]).range([0.1, 10]);

// Color scale based on temperature (spectral class)
let colors = [
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
let temps = [
  2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 14000, 20000, 30000,
];

let colorScale = d3.scaleLinear().domain(temps).range(colors);

d3.json("stars.json").then(function (stars) {
  // Filter the stars to only include stars with a constellation
  const starsWithConstellation = stars.filter((star) => star.constellation);

  // Create an array of constellations
  const constellations = [
    ...new Set(starsWithConstellation.map((star) => star.constellation)),
  ];

  // Select the dropdown element
  const dropdown = d3.select("#dropdown");

  // Add an option for "All", "Closest Stars", and "Brightest Stars"
  dropdown
    .selectAll("option")
    .data([
      "All",
      "Closest Stars 10 ly",
      "Closest Stars 100 ly",
      "Closest Stars 1000 ly",
      "Bright Stars",
      "Bigger than 50 R⊙",
      "Bigger than 10 R⊙",
      "Bigger than 1 R⊙",
      "Smaller than 1 R⊙",
      "Younger than 10 Myr",
      "Younger than 100 Myr",
      "Younger than 1 Gyr",
      "Older than 1 Gyr",
      "Older than 10 Gyr",
      "Mass > 100 M⊙",
      "Mass > 10 M⊙",
      "Mass > 1 M⊙",
      "Mass < 1 M⊙",
    ])
    .enter()
    .append("option")
    .text((d) => d);

  // Add a divider
  dropdown.append("option").text("----------").attr("disabled", true);

  // Add an option for each constellation
  dropdown
    .selectAll("option.constellation")
    .data(constellations)
    .enter()
    .append("option")
    .attr("class", "constellation")
    .text((d) => d);

  // Add an event listener to the dropdown
  dropdown.on("change", function () {
    // Get the selected option
    const selectedOption = d3.select(this).property("value");

    let filteredStars;

    switch (selectedOption) {
      case "Closest Stars 10 ly":
        filteredStars = stars.filter((star) => star.distance <= 10);
        break;
      case "Closest Stars 100 ly":
        filteredStars = stars.filter((star) => star.distance <= 100);
        break;
      case "Closest Stars 1000 ly":
        filteredStars = stars.filter((star) => star.distance <= 1000);
        break;
      case "Bright Stars":
        filteredStars = stars.filter((star) => star.apparentMagnitude <= 2);
        break;
      case "Bigger than 50 R⊙":
        filteredStars = stars.filter((star) => star.radius >= 50);
        break;
      case "Bigger than 10 R⊙":
        filteredStars = stars.filter((star) => star.radius >= 10);
        break;
      case "Bigger than 1 R⊙":
        filteredStars = stars.filter((star) => star.radius >= 1);
        break;
      case "Smaller than 1 R⊙":
        filteredStars = stars.filter((star) => star.radius < 1);
        break;

      case "Younger than 10 Myr":
        filteredStars = stars.filter((star) => star.age <= 10000000);
        break;
      case "Younger than 100 Myr":
        filteredStars = stars.filter((star) => star.age <= 100000000);
        break;
      case "Younger than 1 Gyr":
        filteredStars = stars.filter((star) => star.age <= 1000000000);
        break;
      case "Older than 1 Gyr":
        filteredStars = stars.filter((star) => star.age >= 1000000000);
        break;
      case "Older than 10 Gyr":
        filteredStars = stars.filter((star) => star.age >= 10000000000);
        break;
      case "Mass > 100 M⊙":
        filteredStars = stars.filter((star) => star.mass >= 100);
        break;
      case "Mass > 10 M⊙":
        filteredStars = stars.filter((star) => star.mass >= 10);
        break;
      case "Mass > 1 M⊙":
        filteredStars = stars.filter((star) => star.mass >= 1);
        break;
      case "Mass < 1 M⊙":
        filteredStars = stars.filter((star) => star.mass < 1);
        break;

      case "All":
        filteredStars = stars;
        break;
      default:
        filteredStars = stars.filter(
          (star) => star.constellation === selectedOption
        );
    }

    // Update the visualization with the filtered stars
    let circles = svg.selectAll("circle").data(filteredStars, (d) => d.name);
    circles
      .enter()
      .append("circle")
      .merge(circles)
      .attr("cx", (d) => xScale(d.temperature))
      .attr("cy", (d) => yScale(d.luminosity))
      .attr("r", (d) => radiusScale(d.radius))
      .style("fill", (d) => colorScale(d.temperature));

    circles
      .attr("cx", (d) => xScale(d.temperature))
      .attr("cy", (d) => yScale(d.luminosity));

    circles
      .enter()
      .append("circle")
      .merge(circles)
      .attr("cx", (d) => xScale(d.temperature))
      .attr("cy", (d) => yScale(d.luminosity))
      .attr("r", (d) => radiusScale(d.radius))
      .style("fill", (d) => colorScale(d.temperature))

      .on("mouseover", (event, d) => {
        tooltip.style("display", "block");
        tooltip.html(`
        <strong>${d.name}</strong><br>
        Constellation: ${d.constellation}<br>
        Temperature: ${d.temperature
          .toLocaleString("en-US", { useGrouping: true })
          .replace(/,/g, " ")} K <br>
        Luminosity: ${d.luminosity
          .toLocaleString("en-US", { useGrouping: true })
          .replace(/,/g, " ")} L⊙<br>
        Radius: ${d.radius
          .toLocaleString("en-US", { useGrouping: true })
          .replace(/,/g, " ")} R⊙<br>
        Apparent Magnitude: ${d.apparentMagnitude
          .toLocaleString("en-US", { useGrouping: true })
          .replace(/,/g, " ")}<br>
        Distance: ${d.distance
          .toLocaleString("en-US", { useGrouping: true })
          .replace(/,/g, " ")} ly<br>

        Age: ${
          d.age
            ? d.age
                .toLocaleString("en-US", { useGrouping: true })
                .replace(/,/g, " ")
            : "N/A"
        } y<br>
        Mass: ${
          d.mass
            ? d.mass
                .toLocaleString("en-US", { useGrouping: true })
                .replace(/,/g, " ")
            : "N/A"
        } M⊙
      `);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", event.pageX + 10 + "px");
        tooltip.style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    const labels = svg
      .selectAll(".star-label")
      .data(filteredStars, (d) => d.name);

    labels
      .enter()
      .append("text")
      .attr("class", "star-label")
      .attr("x", (d) => xScale(d.temperature) + 10)
      .attr("y", (d) => yScale(d.luminosity))
      .text((d) => d.name)
      .style("font-size", "11px")
      .style("fill", "#fff")
      .style("text-shadow", "2px 2px 4px #000");

    labels
      .attr("x", (d) => xScale(d.temperature) + 10)
      .attr("y", (d) => yScale(d.luminosity));

    circles.exit().remove();
    labels.exit().remove();
  });

  svg.selectAll("circle");

  svg
    .append("text")
    .attr("class", "headline")
    .attr("x", width / 2)
    .attr("y", margin.top / 2 + 10)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("text-decoration", "none")
    .text("H-R Diagram");

  // Add text about the number of stars
  svg
    .append("text")
    .style("font-size", "10px")
    .attr("class", "number-of-stars")
    .attr("x", width / 2) // Set x to half of the width of the SVG
    .attr("y", margin.top / 2 + 25)
    .attr("text-anchor", "middle") // Center the text at the x position
    .text(stars.length + " stars in database");
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
    .selectAll(".star-label") // Add a class here
    .data(stars)
    .enter()
    .append("text")
    .attr("class", "star-label") // And here
    .attr("x", (d) => xScale(d.temperature) + 10)
    .attr("y", (d) => yScale(d.luminosity))
    .text((d) => d.name)
    .style("font-size", "11px") // Increase the font size
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
    .attr("class", "y-label")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text("Luminosity (Solar Units)");

  svg
    .selectAll("circle")
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block");
      tooltip.html(`
      <strong>${d.name}</strong><br>
      Constellation: ${d.constellation}<br>
      Temperature: ${d.temperature
        .toLocaleString("en-US", { useGrouping: true })
        .replace(/,/g, " ")} K <br>
      Luminosity: ${d.luminosity
        .toLocaleString("en-US", { useGrouping: true })
        .replace(/,/g, " ")} L⊙<br>
      Radius: ${d.radius
        .toLocaleString("en-US", { useGrouping: true })
        .replace(/,/g, " ")} R⊙<br>
      Apparent Magnitude: ${d.apparentMagnitude
        .toLocaleString("en-US", { useGrouping: true })
        .replace(/,/g, " ")}<br>
      Distance: ${d.distance
        .toLocaleString("en-US", { useGrouping: true })
        .replace(/,/g, " ")} ly<br>
    
      Age: ${
        d.age
          ? d.age
              .toLocaleString("en-US", { useGrouping: true })
              .replace(/,/g, " ")
          : "N/A"
      } y<br>
      Mass: ${
        d.mass
          ? d.mass
              .toLocaleString("en-US", { useGrouping: true })
              .replace(/,/g, " ")
          : "N/A"
      } M⊙
    `);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", event.pageX + 10 + "px");
      tooltip.style("top", event.pageY - 10 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  window.addEventListener("resize", () => {
    width = parseInt(container.style("width"));
    height = parseInt(container.style("height"));

    // Update the position of the x-axis label
    svg
      .select(".x-label")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom + 10);

    // Update the viewBox of the SVG
    svg.attr("viewBox", `0 0 ${width} ${height - 10}`);

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

    // Update the position of the headline and number of stars text
    svg.select(".headline").attr("x", width / 2);
    svg.select(".number-of-stars").attr("x", width / 2);
    svg.select(".y-label").attr("x", -height / 2);

    // Update the position of the x-axis label
    svg
      .select(".x-label")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom + 30); // Adjust this value as needed

    svg
      .selectAll(".star-label") // Select only the star labels
      .attr("x", (d) => xScale(d.temperature) + 10)
      .attr("y", (d) => yScale(d.luminosity));
  });
});
