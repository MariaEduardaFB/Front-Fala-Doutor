function adicionaOuRemoveDias(data, modificador){
    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + modificador);
    return novaData;
}

function buscaInicioSemana(data) {
    const novaData = new Date(data);
    const diaSemana = novaData.getDay(); 
    novaData.setDate(novaData.getDate() - diaSemana);
    novaData.setHours(0, 0, 0, 0);
    return novaData;
}

function buscaInicioMes(data) {
    const novaData = new Date(data);
    novaData.setDate(1);
    novaData.setHours(0, 0, 0, 0);
    return novaData;
}

function buscaInicioAno(data) {
    const novaData = new Date(data);
    novaData.setMonth(0, 1); 
    novaData.setHours(0, 0, 0, 0);
    return novaData;
}

export {adicionaOuRemoveDias, buscaInicioSemana, buscaInicioMes, buscaInicioAno};