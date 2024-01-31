let container = d3.select("#hr-diagram");
let width = parseInt(container.style("width"));
let height = parseInt(container.style("height"));
let checkbox = d3.select("#star-name-toggle");
let starNames = d3.selectAll(".star-label");

// Hide star labels initially

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
  .style("background", "#ebebeb")
  .style("padding", "5px")
  .style("border", "1px solid #121212")
  .style("border-radius", "5px")
  .style("pointer-events", "none") // to prevent the tooltip from interfering with mouse events
  .style("display", "none")
  .style("color", "black");

// Define scales for temperature, luminosity, and radius (logarithmic)
const xScale = d3
  .scaleLinear()
  .domain([45000, 100])
  .range([margin.left, width - margin.right]);

const yScale = d3
  .scaleLog()
  .domain([0.00003, 7000000])
  .range([height - margin.bottom, margin.top]);

//const radiusScale = d3.scaleLog().domain([0.01, 1000]).range([2, 20]); // Original
const radiusScale = d3.scaleLog().domain([0.003, 50]).range([0.1, 10]);

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

d3.json("stars-sort.json").then(function (stars) {
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
      "Hypergiants",
      "Supergiants",
      "Giants",
      "Subgiants",
      "Main Sequence",
      "White Dwarfs",
      "Red Dwarfs",
      "L stars",
      "O stars",
      "B stars",
      "A stars",
      "F stars",
      "G stars",
      "K stars",
      "M stars",
      "D stars",
      "Distance < 10 ly",
      "Distance 10 to 100 ly",
      "Distance 100 to 1000 ly",
      "Distance > 1000 ly",
      "App. mag. < 0.6",
      "App. mag. 0.6 to 2.0",
      "App. mag. > 2.0",
      "Radius > 50 R⊙",
      "Radius 10 to 50 R⊙",
      "Radius 1 to 10 R⊙",
      "Radius < 1 R⊙",
      "Age < 10 Myr",
      "Age 10 to 100 Myr",
      "Age 100 to 1 Gyr",
      "Age 1 to 10 Gyr",
      "Age > 10 Gyr",
      "Mass > 30 M⊙",
      "Mass 20 to 30 M⊙",
      "Mass 10 to 20 M⊙",
      "Mass 5 to 10 M⊙",
      "Mass 1 to 5 M⊙",
      "Mass 0.5 to 1 M⊙",
      "Mass < 0.5 M⊙",
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
      case "Hypergiants":
        filteredStars = stars.filter((star) => star.type == "hypergiant");
        break;
      case "Supergiants":
        filteredStars = stars.filter((star) => star.type == "supergiant");
        break;
      case "Giants":
        filteredStars = stars.filter((star) => star.type == "giant");
        break;
      case "Subgiants":
        filteredStars = stars.filter((star) => star.type == "subgiant");
        break;
      case "Main Sequence":
        filteredStars = stars.filter((star) => star.type == "main sequence");
        break;
      case "White Dwarfs":
        filteredStars = stars.filter((star) => star.type == "white dwarf");
        break;
      case "Red Dwarfs":
        filteredStars = stars.filter((star) => star.type == "red dwarf");
        break;
      case "Brown Dwarfs":
        filteredStars = stars.filter((star) => star.type == "brown dwarf");
        break;
      case "L stars":
        filteredStars = stars.filter(
          (star) => star.spectralClass.charAt(0) == "L"
        );
        break;

      case "O stars":
        filteredStars = stars.filter(
          (star) => star.spectralClass.charAt(0) == "O"
        );
        break;
      case "B stars":
        filteredStars = stars.filter(
          (star) => star.spectralClass.charAt(0) == "B"
        );
        break;
      case "A stars":
        filteredStars = stars.filter(
          (star) => star.spectralClass.charAt(0) == "A"
        );
        break;
      case "F stars":
        filteredStars = stars.filter(
          (star) => star.spectralClass.charAt(0) == "F"
        );
        break;
      case "G stars":
        filteredStars = stars.filter(
          (star) => star.spectralClass.charAt(0) == "G"
        );
        break;
      case "K stars":
        filteredStars = stars.filter(
          (star) => star.spectralClass.charAt(0) == "K"
        );
        break;
      case "M stars":
        filteredStars = stars.filter(
          (star) => star.spectralClass.charAt(0) == "M"
        );
        break;
      case "D stars":
        filteredStars = stars.filter(
          (star) => star.spectralClass.charAt(0) == "D"
        );
        break;

      case "Distance < 10 ly":
        filteredStars = stars.filter((star) => star.distance <= 10);
        break;
      case "Distance 10 to 100 ly":
        filteredStars = stars.filter(
          (star) => star.distance > 10 && star.distance <= 100
        );
        break;
      case "Distance 100 to 1000 ly":
        filteredStars = stars.filter(
          (star) => star.distance > 100 && star.distance <= 1000
        );
        break;
      case "Distance > 1000 ly":
        filteredStars = stars.filter((star) => star.distance > 1000);
        break;

      case "App. mag. < 0.6":
        filteredStars = stars.filter((star) => star.apparentMagnitude <= 0.6);
        break;
      case "App. mag. 0.6 to 2.0":
        filteredStars = stars.filter(
          (star) => star.apparentMagnitude > 0.6 && star.apparentMagnitude <= 2
        );
        break;
      case "App. mag. > 2.0":
        filteredStars = stars.filter((star) => star.apparentMagnitude > 2);
        break;
      case "Radius > 50 R⊙":
        filteredStars = stars.filter((star) => star.radius > 50);
        break;
      case "Radius 10 to 50 R⊙":
        filteredStars = stars.filter(
          (star) => star.radius >= 10 && star.radius < 50
        );
        break;
      case "Radius 1 to 10 R⊙":
        filteredStars = stars.filter(
          (star) => star.radius >= 1 && star.radius < 10
        );
        break;
      case "Radius < 1 R⊙":
        filteredStars = stars.filter((star) => star.radius < 1);
        break;
      case "Age < 10 Myr":
        filteredStars = stars.filter(
          (star) => star.age <= 10000000 && star.age
        );
        break;
      case "Age 10 to 100 Myr":
        filteredStars = stars.filter(
          (star) => star.age > 10000000 && star.age <= 100000000
        );
        break;
      case "Age 100 to 1 Gyr":
        filteredStars = stars.filter(
          (star) => star.age > 100000000 && star.age <= 1000000000
        );
        break;
      case "Age 1 to 10 Gyr":
        filteredStars = stars.filter(
          (star) => star.age > 1000000000 && star.age <= 10000000000
        );
        break;
      case "Age > 10 Gyr":
        filteredStars = stars.filter((star) => star.age > 10000000000);
        break;

      case "Mass > 30 M⊙":
        filteredStars = stars.filter((star) => star.mass >= 30);
        break;
      case "Mass 20 to 30 M⊙":
        filteredStars = stars.filter(
          (star) => star.mass >= 20 && star.mass < 30
        );
        break;
      case "Mass 10 to 20 M⊙":
        filteredStars = stars.filter(
          (star) => star.mass >= 10 && star.mass < 20
        );
        break;
      case "Mass 5 to 10 M⊙":
        filteredStars = stars.filter(
          (star) => star.mass >= 5 && star.mass < 10
        );
        break;
      case "Mass 1 to 5 M⊙":
        filteredStars = stars.filter((star) => star.mass >= 1 && star.mass < 5);
        break;
      case "Mass 0.5 to 1 M⊙":
        filteredStars = stars.filter(
          (star) => star.mass >= 0.5 && star.mass < 1
        );
        break;
      case "Mass < 0.5 M⊙":
        filteredStars = stars.filter((star) => star.mass < 0.5);
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
        Type: ${d.type}<br>
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
        tooltip.style("left", event.pageX + 1 + "px");
        tooltip.style("top", event.pageY - 1 + "px");
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

    /*     d3.selectAll(".star-label").style("display", "none"); */

    labels
      .attr("x", (d) => xScale(d.temperature) + 10)
      .attr("y", (d) => yScale(d.luminosity));

    circles.exit().remove();
    labels.exit().remove();
  });

  checkbox.on("change", function () {
    // In the event handler, select all star names
    starNames = d3.selectAll(".star-label");

    //  If checkbox is checked, set star names to visible, else set them to hidden
    if (d3.select(this).property("checked")) {
      starNames.style("display", "block");
    } else {
      starNames.style("display", "none");
    }
  });

  svg.selectAll("circle");

  svg
    .append("text")
    .attr("class", "headline")
    .attr("x", margin.left + 100) // Position at the left edge
    .attr("y", height - margin.bottom - 90) // Position at the bottom edge
    /*    .attr("x", width / 2 - 40)
    .attr("y", margin.top / 2 + 15) */
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("text-decoration", "none")
    .text("H-R Diagram");

  svg
    .append("text")
    .attr("class", "creator-name")
    .attr("x", margin.left + 230) // Position at the left edge
    .attr("y", height - margin.bottom - 90) // Position at the bottom edge
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("text-decoration", "none")
    .text("by Paul Belfrage");
  // Add text about the number of stars
  svg
    .append("text")
    .style("font-size", "11px")
    .attr("class", "number-of-stars")
    .attr("x", margin.left + 100) // Position at the left edge
    .attr("y", height - margin.bottom - 70) // Position at the bottom edge
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
    // Code that creates the star labels
    .attr("class", "star-label") // And here
    .attr("x", (d) => xScale(d.temperature) + 10)
    .attr("y", (d) => yScale(d.luminosity))
    .text((d) => d.name)
    .style("font-size", "11px") // Increase the font size
    .style("fill", "#fff") // Change the font color to white
    .style("text-shadow", "2px 2px 4px #000"); // Add a black text shadow

  // Define a custom locale with space as the thousand separator
  const customLocale = {
    decimal: ".",
    thousands: " ",
    grouping: [3],
    currency: ["$", ""],
  };

  // Use the custom locale to format the numbers
  const format = d3.formatLocale(customLocale).format(",");

  // Define x-axis with conditional decimal places and thousand separator
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(10, "d")
    .tickFormat(function (d) {
      return d < 1 ? d3.format(".3f")(d) : format(d);
    }); // Add x-axis

  //// Hide star labels initially
  /*   d3.selectAll(".star-label").style("display", "none"); */

  svg
    .append("g")
    .attr("class", "x-axis")
    /* .attr("transform", `translate(0, ${height - margin.bottom})`) */
    .attr(
      "transform",
      `translate(${margin.left - 60}, ${height - margin.bottom})`
    ) // Decrease the value to move the x-axis to the left
    .call(xAxis);

  // Define y-axis with conditional decimal places and thousand separator
  const yAxis = d3
    .axisLeft(yScale)
    .ticks(10, "d")
    .tickFormat(function (d) {
      return d < 1 ? parseFloat(d3.format(".3f")(d)) : format(d);
    });
  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left - 30}, 0)`)
    .call(yAxis)
    .selectAll("text")
    .attr("transform", "rotate(-60)") // Rotate the labels -45 degrees
    .style("text-anchor", "end");

  // Add x-axis label
  svg
    .append("text")
    .attr("class", "x-label")
    .attr("x", width / 2)
    .attr("y", height - 3)
    .style("text-anchor", "middle")
    .text("Temperature (K)");

  // Add y-axis label
  svg
    .append("text")
    .attr("class", "y-label")
    .attr("x", -height / 2 - 20)
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text("Luminosity (L⊙)");

  svg
    .selectAll("circle")
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block");
      tooltip.html(`
      <strong>${d.name}</strong><br>
      Type: ${d.type}<br>
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
      tooltip.style("left", event.pageX + 1 + "px");
      tooltip.style("top", event.pageY - 1 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  // Add an event listener to the window
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
      .call(d3.axisBottom(xScale))
      .call(xAxis);

    svg.select(".y-axis").call(d3.axisLeft(yScale)).call(yAxis);

    // Update the positions of the circles
    svg
      .selectAll("circle")
      .attr("cx", (d) => xScale(d.temperature))
      .attr("cy", (d) => yScale(d.luminosity));

    // Update the position of the headline and number of stars text
    svg.select(".headline").attr("x", margin.left + 100);
    svg.select(".number-of-stars").attr("x", margin.left + 100);
    svg.select(".creator-name").attr("x", margin.left + 230);

    svg.select(".headline").attr("y", height - margin.bottom - 90);
    svg.select(".number-of-stars").attr("y", height - margin.bottom - 70);
    svg.select(".creator-name").attr("y", height - margin.bottom - 90);

    svg.select(".y-label").attr("x", -height / 2);

    // Update the position of the x-axis label
    svg
      .select(".x-label")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom + 35); // Adjust this value as needed

    svg
      .selectAll(".star-label") // Select only the star labels
      .attr("x", (d) => xScale(d.temperature) + 10)
      .attr("y", (d) => yScale(d.luminosity));
  });
});
