class Coche {

  abrePuerta(){
    document.getElementById("puerta").innerText = "open";
  }

  cierraPuerta(){
    document.getElementById("puerta").innerText = "closed";
  }

  enciendeMotor(){
    document.getElementById("motor").innerText = "on";
  }

  apagaMotor(){
    document.getElementById("motor").innerText = "off";
  }

  enciendeAlarma(){
    document.getElementById("alarma").innerText = "on";
  }

  apagaAlarma(){
    document.getElementById("alarma").innerText = "off";
  }
}
