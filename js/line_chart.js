let data, margin, svg, lx, ly, region_name;
const data_link = 'https://dasshims.github.io/State_zhvi_uc_sfrcondo_tier.csv'
//const data_link = 'data/State_zhvi_uc_sfrcondo_tier.csv';

const events = {
    2000: "the Dot.com (or Technology) Bubble",
    2003: "Iraq War post 9/11",
    2007: "Sub-Prime Housing Crisis",
    2009: "Global Recession & the Collapse of Wall Street",
    2015: "Chinese stock market crash",
    2016: "Brexit",
    2017: "Bitcoin skyrocketed",
    2020: "Covid hit"
}

region_name = (new URL(document.location)).searchParams.get("state");

margin = {top: 30, right: 0, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

async function hideControls() {
    const el_control = document.getElementById('controls');
    console.log(el_control)
    el_control.visibility = 'hidden';
}

async function unHideControls() {
    const element_prev = document.getElementById('controls');
    element_prev.style.visibility = 'visible';
}

async function drawAxisForLineChart2(data, region_name, lx, ly) {
    console.log("Inside drawAxisForLineChart2. RegionName :" + region_name)

    data = await d3.csv(data_link, function (d) {
        return {date: d3.timeParse("%Y-%m-%d")(d.year), value: d.price, RegionName: d.RegionName, year: d.year}
    });

    data = data = data.sort(function (a, b) {
        return d3.ascending(a.date, b.date);
    })

    svg = d3.select("#side_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right + 200)
        .attr("height", height + margin.top + margin.bottom + 100)
        .append("g")
        .attr("transform",
            "translate(" + 70 + "," + 120 + ")");
    //"translate(" + margin.left + "," + margin.top + ")");

    lx = d3.scaleTime()
        .domain(d3.extent(data, function (d) {
            return d.date;
        }))
        .range([0, width + 25]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(lx))
        .attr("stroke-width", "1")
        .style("text-anchor", "centre")
        .attr("stroke", "#555353")
        .attr("opacity", ".8")
        .style('text-align', 'right')
        .attr('font-family', 'Courier New');

    ly = d3.scaleLinear()
        .domain([0, 900000])
        .range([height, 10]);
    svg.append("g")
        .call(d3.axisLeft(ly))
        .attr("stroke-width", "1")
        .style("text-anchor", "end")
        .attr("stroke", "#555353")
        .attr("opacity", ".8")
        .attr('font-family', 'Courier New');

    svg.append('g')
        .attr("opacity", ".1")
        .call(d3.axisLeft()
            .scale(ly)
            .tickSize(-width, 0, 0)
            .tickFormat(''))
        .attr("stroke-dasharray", "3,3");
}

window.onload = region_name = 'California';
drawAxisForLineChart2(data, region_name, lx, ly);

async function drawLineChart(region_name, trigger_year) {

    //await hideControls();
    console.log("Inside drawLineChart. RegionName :" + region_name + " year " + trigger_year)

    await addDescriptionForScene(trigger_year)

    if (trigger_year == 2000) {
        year = 2007
    } else if (trigger_year == 2008) {
        year = 2018
    } else {
        year = 2023
    }

    if (region_name == 'ALL') {
        drawAllStates()
    }

    data = await d3.csv(data_link, function (d) {
        return {date: d3.timeParse("%Y-%m-%d")(d.year), value: d.price, RegionName: d.RegionName, year: d.year}
    });

    data = data = data.sort(function (a, b) {
        return d3.ascending(a.date, b.date);
    })

    lx = d3.scaleTime()
        .domain(d3.extent(data, function (d) {
            return d.date;
        }))
        .range([0, width + 10]);

    ly = d3.scaleLinear()
        .domain([0, 900000])
        .range([height, 10]);

    data = await data.filter(function (d) {
        return d.RegionName == region_name
            && d.date != undefined
            && d.date.getFullYear() >= trigger_year - 1
            && d.date.getFullYear() <= year
    })


    await addPaths();
    await addDots();
    //await animateEvents(year)
    await unHideControls();

    //Add annotations

}

async function addPaths() {
    let paths = svg.append("path")
        .datum(data)
        .attr("id", "line-chart")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("transform", "translate(0,0)")
        .attr("d", d3.line()
            .x(function (d) {
                return lx(d.date)
            })
            .y(function (d) {
                return ly(d.value)
            })
        )
        .attr("stroke-width", "2")
        .attr("opacity", ".8");

    const length = paths.node().getTotalLength();

    paths.attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", length)
        .transition()
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .duration(5000)
        .style("stroke", "steelblue");

    svg.append('g')
        .classed('labels-group', true)
        .selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .classed('label', true)
        .attr("id", "annotations")
        .attr("x", function (d) {
            return lx(d.date) + 10;
        })
        .attr("y", function (d) {
            return ly(d.value);
        })
        .text(function (d, i) {
            const curr_year = d.date.getFullYear()
            if (d.date.getMonth() == 2) {
                return events[curr_year]
            }
        })
        .attr("transform", "translate(0,0)")
}

async function clearLineChart() {
    d3.selectAll('svg').selectAll("#line-chart").remove();
    d3.selectAll('svg').selectAll("#line-chart-dots").remove();
    d3.selectAll('svg').selectAll("#annotations").remove();
    d3.selectAll('svg').selectAll("#description-text").remove();
    // d3.selectAll('svg').selectAll("#year-text").remove();
}

async function addDescriptionForScene(year) {
    const acts = {
        2000: 'The early 2000s recession was a decline in economic activity which mainly occurred in developed countries. ' +
            'The recession affected the European Union during 2000 and 2001 and the United States from March to November 2001. ' +
            'After that the US housing market was on a steady ascent. Economic conditions were favorable, with steady job growth, low-interest rates, ' +
            'and increasing demand for housing.',
        2008: 'The narrative took an unexpected turn in 2008. A financial storm brewed, known as the Great Recession. ' +
            'A perfect storm of subprime mortgage crisis, housing bubble, and banking failures struck the housing market with great force. ' +
            'Foreclosures soared, leading to a glut of unsold homes. ' +
            'Homeowners, once hopeful, faced distressing situations as housing prices plummeted. ' +
            'The once thriving housing market now lay in ruins, leaving countless families with homes worth far less than their mortgages.',
        2020: 'As the years went by, the housing market gradually recovered from the scars of the Great Recession. ' +
            'A sense of stability returned, with housing prices once again on the rise. However, the year 2020 brought a new and unforeseen challenge - a global pandemic known as COVID-19.' +
            'As COVID-19 swept across the nation, it unleashed a wave of economic uncertainties. Businesses shuttered, jobs were lost, and the housing market braced for impact. Government-mandated lockdowns and fear of the virus led to a slowdown in real estate activity. Housing prices saw a brief dip as the nation grappled with the pandemic\'s impact on the economy.'
    }

    const event_el = document.getElementById('events');
    event_el.innerHTML += '<br>' + acts[year] + '</br>'
    event_el.scrollTop = event_el.scrollHeight;
    event_el.style.overflow = 'auto';
    event_el.style.fontSize = 14;
    event_el.style.fontWeight = 400;
    event_el.style.fontFamily = 'Courier New';
    event_el.style.color = 'black';
}

function getStateFromDropDown() {
    let selectElement = document.getElementById('state-dropdown')
    return selectElement.value;
}

async function drawAllStates() {

    const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']

    states.forEach(async state => {
        await clearLineChart();
        await drawLineChart(state);
    })
}

async function animateEvents(maxYear) {

    var events_el = document.getElementById('events')
    events_el.style.backgroundColor = 'whitesmoke';
    events_el.style.visibility = 'visible';

    let currentYear = 2000;
    while (currentYear <= maxYear) {
        setEvents(currentYear)
        await new Promise(r => setTimeout(r, 1000));
        currentYear += 1;
    }
}

async function setEvents(year) {

    var event_el = document.getElementById('events');
    event_el.style.overflow = 'auto';
    event_el.scrollTop = event_el.scrollHeight;
    event_el.innerHTML += '<br>' + events[year] + '</br>'
    event_el.scrollTop = event_el.scrollHeight;
    event_el.style.fontSize = 14;
    event_el.style.fontWeight = 400;
    event_el.style.fontFamily = 'Courier New';
    event_el.style.color = 'black';
}

async function addDots() {
    let dots = svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("id", "line-chart-dots")
        .attr("cx", function (d) {
            return lx(d.date);
        })
        .attr("cy", height);

    dots.transition()
        .duration(5000)
        .attr("cx", function (d) {
            return lx(d.date);
        })
        .attr("cy", function (d) {
            return ly(d.value);
        })
        .attr("r", 4)
        .attr("transform", "translate(0,0)")
        .style("fill", "#e6f5ff")
        .attr('opacity', .1)
        .delay(function (d, i) {
            return (i * 20)
        });

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "0")
        .style("visibility", "hidden")
        .style("boarder", "black")
        .text("a simple tooltip");

    dots.on("mouseover", function (d, i) {
        d3.select(this)
            .transition()
            .duration('50')
            .attr('opacity', '.8');
        tooltip.html("<br><strong> " + d.year + " - " + d.value + "</strong>")
            .style('top', d3.event.pageY + 12 + 'px')
            .style('left', d3.event.pageX + 25 + 'px')
            .style("opacity", .8);
        return tooltip.style("visibility", "visible");
    });

    dots.on("mouseout", function () {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', .1);
        return tooltip.style("visibility", "hidden");
    });
}


async function addAnnotations() {
    const type = d3.annotationLabel
    const annotations = [{
        note: {
            label: "Housing market slows down after Sub-Prime Housing Crisis",
            bgPadding: 20,
            title: "2008"
        },
        //can use x, y directly instead of data
        data: {date: "2008-12-31", close: 185.02},
        className: "show-bg",
        // x: 100,
        y: 50,
        dy: 100,
        dx: 100
        // dy: 137,
        // dx: 162
    }]

    const parseTime = d3.timeParse("%Y-%m-%d")
    const timeFormat = d3.timeFormat("%d-%b-%y")

    const makeAnnotations = d3.annotation()
        .editMode(true)
        .notePadding(15)
        .type(type)
        .accessors({
            x: function (d) {
                console.log(lx(parseTime('2008-12-31')));
                return lx(parseTime('2008-12-31'))
            },
            y: 50 // function(d) { console.log(d.price); console.log(y(d.price)); return y(d.price)}
        })
        .annotations(annotations)

    // svg
    //     .append("g")
    //     .call(makeAnnotations)

    // const makeAnnotations = d3.annotation()
    //     .editMode(true)
    //     //also can set and override in the note.padding property
    //     //of the annotation object
    //     .notePadding(15)
    //     .type(type)
    //     //accessors & accessorsInverse not needed
    //     //if using x, y in annotations JSON
    //     .accessors({
    //         x: d => x(parseTime(d.date)),
    //         y: d => y(d.close)
    //     })
    //     .accessorsInverse({
    //         date: d => timeFormat(x.invert(d.x)),
    //         close: d => y.invert(d.y)
    //     })
    //     .annotations(annotations)

    //     .append("g")
    //     .attr("class", "annotation-group")
    //     .call(makeAnnotations)
}