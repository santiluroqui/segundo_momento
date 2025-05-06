const csvUrl = 'https://raw.githubusercontent.com/rudyluis/DashboardJS/main/superstore_data.csv';

let rawData = [];
let charts = [];

$(document).ready(function () {
  $.ajax({
    url: csvUrl,
    dataType: 'text',
  }).done(function (data) {
    const allRows = data.split(/\r?\n|\r/);
    const headers = allRows[0].split(',');

    rawData = allRows.slice(1).map(row => {
      const values = row.split(',');
      const entry = {};
      headers.forEach((header, i) => {
        entry[header] = values[i];
      });
      return entry;
    });

    populateFilters();
    loadTable(rawData);
    drawAllCharts(rawData);
  });

  $('#categoryFilter, #regionFilter, #segmentFilter').on('change', function () {
    const filtered = filterData();
    $('#dataTable').DataTable().clear().rows.add(filtered).draw();
    updateCharts(filtered);
  });
});

function populateFilters() {
  populateSelect('Category', '#categoryFilter');
  populateSelect('Region', '#regionFilter');
  populateSelect('Segment', '#segmentFilter');
}

function populateSelect(key, selector) {
  const options = [...new Set(rawData.map(item => item[key]))];
  $(selector).append(`<option value="">Todos</option>`);
  options.forEach(opt => $(selector).append(`<option value="${opt}">${opt}</option>`));
}

function filterData() {
  const category = $('#categoryFilter').val();
  const region = $('#regionFilter').val();
  const segment = $('#segmentFilter').val();

  return rawData.filter(item =>
    (category === '' || item['Category'] === category) &&
    (region === '' || item['Region'] === region) &&
    (segment === '' || item['Segment'] === segment)
  );
}

function loadTable(data) {
  $('#dataTable').DataTable({
    data: data,
    columns: Object.keys(data[0]).map(key => ({ title: key, data: key })),
    destroy: true,
    pageLength: 10
  });
}

function drawAllCharts(data) {
  destroyCharts();

  charts.push(drawChart('chartBar', 'bar', groupSum(data, 'Category', 'Sales')));
  charts.push(drawChart('chartPie', 'pie', groupSum(data, 'Region', 'Profit')));
  charts.push(drawChart('chartLine', 'line', groupSum(data, 'Order Date', 'Sales', true)));
  charts.push(drawChart('chartRadar', 'radar', groupSum(data, 'Segment', 'Quantity')));

  charts.push(drawChart('chart1', 'bar', groupSum(data, 'Sub-Category', 'Sales')));
  charts.push(drawChart('chart2', 'doughnut', groupSum(data, 'Ship Mode', 'Sales')));
  charts.push(drawChart('chart3', 'bar', groupSum(data, 'Region', 'Quantity')));
  charts.push(drawChart('chart4', 'line', groupSum(data, 'Ship Date', 'Profit', true)));
  charts.push(drawChart('chart5', 'pie', groupSum(data, 'Segment', 'Sales')));
  charts.push(drawChart('chart6', 'bar', groupSum(data, 'Category', 'Profit')));
}

function updateCharts(data) {
  drawAllCharts(data);
}

function destroyCharts() {
  charts.forEach(c => c.destroy());
  charts = [];
}

function drawChart(canvasId, type, chartData) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, {
    type: type,
    data: {
      labels: chartData.labels,
      datasets: [{
        label: chartData.label,
        data: chartData.values,
        backgroundColor: generateColors(chartData.labels.length, 0.6),
        borderColor: generateColors(chartData.labels.length, 1),
        borderWidth: 1,
        hoverBorderWidth: 2,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#343a40',
            font: {
              size: 13
            }
          }
        },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#343a40',
          bodyColor: '#343a40',
          borderColor: '#ddd',
          borderWidth: 1
        }
      },
      scales: type === 'radar' ? {} : {
        x: {
          ticks: { color: '#343a40' },
          grid: { color: '#e0e0e0' }
        },
        y: {
          ticks: { color: '#343a40' },
          grid: { color: '#e0e0e0' }
        }
      }
    }
  });
}

function groupSum(data, key, valueKey, parseDate = false) {
  const grouped = {};

  data.forEach(item => {
    let keyValue = item[key];
    if (parseDate && item[key]) {
      keyValue = item[key].split('/')[2];
    }
    if (!grouped[keyValue]) grouped[keyValue] = 0;
    grouped[keyValue] += parseFloat(item[valueKey]) || 0;
  });

  const labels = Object.keys(grouped);
  const values = labels.map(k => grouped[k]);

  return { labels, values, label: `${valueKey} por ${key}` };
}

function generateColors(n, opacity = 1) {
  const colorPalette = [
    'rgba(255, 99, 132, ' + opacity + ')',
    'rgba(54, 162, 235, ' + opacity + ')',
    'rgba(255, 206, 86, ' + opacity + ')',
    'rgba(75, 192, 192, ' + opacity + ')',
    'rgba(153, 102, 255, ' + opacity + ')',
    'rgba(255, 159, 64, ' + opacity + ')',
    'rgba(199, 199, 199, ' + opacity + ')',
    'rgba(83, 102, 255, ' + opacity + ')',
    'rgba(255, 99, 71, ' + opacity + ')',
    'rgba(100, 221, 23, ' + opacity + ')',
    'rgba(156, 39, 176, ' + opacity + ')',
    'rgba(0, 188, 212, ' + opacity + ')',
    'rgba(255, 165, 0, ' + opacity + ')',
    'rgba(0, 128, 0, ' + opacity + ')',
    'rgba(0, 0, 255, ' + opacity + ')',
    'rgba(255, 69, 0, ' + opacity + ')',
    'rgba(186, 85, 211, ' + opacity + ')',
    'rgba(34, 139, 34, ' + opacity + ')',
    'rgba(255, 105, 180, ' + opacity + ')',
    'rgba(255, 215, 0, ' + opacity + ')'
  ];

  let colors = [];
  for (let i = 0; i < n; i++) {
    colors.push(colorPalette[i % colorPalette.length]);
  }

  return colors;
}
