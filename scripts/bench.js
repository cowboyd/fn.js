const ora = require("ora");
const Table = require("cli-table2");
const colors = require('colors');

const error = (msg, ...args) => console.log(colors.red(msg), ...args) // eslint-disable-line
const warn = (msg, ...args) => console.log(colors.yellow(msg), ...args) // eslint-disable-line
const info = (msg, ...args) => console.log(colors.cyan(msg), ...args) // eslint-disable-line

function showResults(name, benchmarkResults) {
  info(`Results for ${name}`);

  let table = new Table({
    head: ["NAME", "OPS/SEC", "RELATIVE MARGIN OF ERROR", "SAMPLE SIZE"]
  });

  benchmarkResults.forEach(result => {
    table.push([
      result.target.name,
      result.target.hz.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      `± ${result.target.stats.rme.toFixed(2)}%`,
      result.target.stats.sample.length
    ]);
  });

  console.log(table.toString()); // eslint-disable-line
}

function sortDescResults (benchmarkResults) {
  return benchmarkResults.sort((a, b) => a.target.hz < b.target.hz ? 1 : -1)
}

function run(name) {
  let benchmarkResults = [];
  let suite = require(`../benchmarks/${name}`);
  let spinner = ora(`Running ${name} benchmark`);

  suite
    .on("cycle", event => {
      benchmarkResults.push(event);
    })
    .on("complete", () => {
      spinner.stop();
      showResults(name, sortDescResults(benchmarkResults));
    })
    .run({ async: true });

  spinner.start();
}

let name = process.argv[2];

if (name) {
  run(name);
} else {
  error('Error: you did not specify a name of suite to run.');
  info('ie: npm run bench object-append');
}