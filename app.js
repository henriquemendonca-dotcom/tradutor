let inputTexto = document.querySelector(".texto");

let idioma = document.querySelector(".idioma");

let traducaoSaida =document.querySelector(".traducao");

async function traduzir(){
let url="https://api.mymemory.translated.net/get?q=" + inputTexto.value + "&langpair=pt|" + idioma.value;

let resposta = await fetch(url);

let traducao = await resposta.json();
console.log(traducao);

traducaoSaida.textContent=traducao.responseData.
translatedText;
}

function microfone(){
   // classe
   let voz = window.SpeechRecognition || window.webkitSpeechRecognition;
   // instanciando (construir)
   let ouvirVoz = new voz();

ouvirVoz.onresult = (evento) => {
   inputTexto.value = evento.results[0][0].transcript;
}
ouvirVoz.start();

}
