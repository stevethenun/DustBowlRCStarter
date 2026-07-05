const races=[
{date:'2026-07-04',title:'Freedom Bash',page:'race.html?date=2026-07-04'},
{date:'2026-06-27',title:'Dust Bowl Saturday',page:'race.html?date=2026-06-27'},
{date:'2026-06-20',title:'Broken Parts Classic',page:'race.html?date=2026-06-20'}
];

const sel=document.getElementById('raceDaySelect');
const btn=document.getElementById('viewRaceBtn');
const status=document.getElementById('raceStatus');

sel.innerHTML='<option value="">Select a race...</option>';
races.forEach(r=>{
 const o=document.createElement('option');
 o.value=r.page;
 o.textContent=r.date+' - '+r.title;
 sel.appendChild(o);
});
status.textContent=races.length+' race days loaded.';
sel.onchange=()=>btn.disabled=!sel.value;
btn.onclick=()=>location.href=sel.value;