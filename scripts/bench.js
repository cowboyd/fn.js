const ora = require("ora");
const Table = require("cli-table2");

const suites = {
  append: require("../benchmarks/append")
}

const spinner = ora("Running benchmark");

function showResults(benchmarkResults) {
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

function run(suite) {
  let benchmarkResults = [];
  suite
    .on("cycle", event => {
      benchmarkResults.push(event);
    })
    .on("complete", () => {
      spinner.stop();
      showResults(sortDescResults(benchmarkResults));
    })
    .run({ async: true });

  spinner.start();
}

let suite = process.argv[2];
run(suites[suite]);