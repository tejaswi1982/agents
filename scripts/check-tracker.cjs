// Exercise the supplied sample/report logic without browser or network access.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{location:{search:''}},document:{readyState:'loading',addEventListener(){}},URLSearchParams,Date};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../public/evidence/tracker/app.js'),'utf8'),ctx);
const {buildSample,buildReport}=ctx.window.DERC;
const sample=buildSample(),report=buildReport(sample);
assert.equal(sample.setup.sample,true);
assert.equal(report.total,38);
assert.equal(report.booked,18);
assert.equal(report.pendingFollowups,11);
assert.equal(report.noShows,5);
assert.equal(report.recovered,7);
assert.equal(report.topLeaks.length,3);
const empty=buildReport({setup:null,enquiries:[],recalls:[]});
assert.equal(empty.total,0);assert.equal(empty.responseRate,0);assert.equal(empty.bookedConversion,0);
console.log('PASS: supplied tracker sample/report logic, including empty data.');
