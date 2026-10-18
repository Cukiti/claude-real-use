cat > save.js <<'J'
function guardar(partida) { localStorage.setItem("partida", JSON.stringify(partida)); }
function cargar() { return JSON.parse(localStorage.getItem("partida")); }
J
