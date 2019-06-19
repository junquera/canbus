var cb = new CanBus();

  var coche = new Coche();

  var cpu = new Component("cpu", "01011111");
  var puerta_izda = new Component("puerta_izda", "10101011");

  var puerta_abierta = false;
  var motor_apagado = true;

  var pantalla = new Component("pantalla", "00000100");
  var motor = new Component("motor", "10101001");
  var monitor_alarma = new Component("monitor_alarma", "11100011");
  var alarma = new Component("alarma", "01110101");

  var sniffer = new Component("sniffer");
  sniffer.w = function(c){
    document.getElementById("code").value += c.id + c.code + "\n";
  }
  cb.connectComponent(sniffer);

  var abre_puerta_izda = new Command(puerta_izda.id, "11111001");
  var notifica_apertura_puerta_izda = new Command(pantalla.id, "01101111");
  var cierra_puerta_izda = new Command(puerta_izda.id, "00001111");
  var notifica_cierre_puerta_izda = new Command(pantalla.id, "11000110");
  var enciende_motor = new Command(motor.id, "00110010");
  var notifica_motor_encendido = new Command(pantalla.id, "10101111");
  var apaga_motor = new Command(motor.id, "10111010");
  var notifica_motor_apagado = new Command(pantalla.id, "01010111");
  var notifica_alarma_error = new Command(pantalla.id, "11000000");
  var notifica_alarma_ok = new Command(pantalla.id, "11001000");

  var flag_motor_encendido = new Command(cpu.id, "10100010");
  var flag_motor_apagado = new Command(cpu.id, "10001001");
  var flag_puerta_abierta = new Command(cpu.id, "00100000");
  var flag_puerta_cerrada = new Command(cpu.id, "11001001");

  var check_alarma = new Command(alarma.id, "10010010");
  var alarma_ok = new Command(monitor_alarma.id, "00011110");
  var alarma_err = new Command(monitor_alarma.id, "00001011");

  alarma.addEvent(check_alarma, function(x){
    if(puerta_abierta && motor_apagado){
      x.send(alarma_err);
    }
  });

  var running = true;
  function exit() {
    running = false;
    alert("Fin de ejecución!");
  }

  monitor_alarma.addEvent(alarma_ok, function(x){
    x.send(notifica_alarma_ok);
  });
  monitor_alarma.addEvent(alarma_err, function(x){
    x.send(notifica_alarma_error);
    setTimeout(function(){
      x.send(notifica_alarma_ok);
    }, 5000);
  });

  puerta_izda.addEvent(abre_puerta_izda, function(x){
    x.send(flag_puerta_abierta);
  });
  puerta_izda.addEvent(cierra_puerta_izda, function(x){
    x.send(flag_puerta_cerrada);
  });

  motor.addEvent(enciende_motor, function(x){
    x.send(flag_motor_encendido);
  });
  motor.addEvent(apaga_motor, function(x){
    x.send(flag_motor_apagado);
  });

  cpu.addEvent(flag_puerta_abierta, function(x){
    puerta_abierta = true;
    x.send(notifica_apertura_puerta_izda);
  });
  cpu.addEvent(flag_puerta_cerrada, function(x){
    puerta_abierta = false;
    x.send(notifica_cierre_puerta_izda);
  });

  cpu.addEvent(flag_motor_encendido, function(x){
    x.send(notifica_motor_encendido);
    x.send(notifica_alarma_ok);
    motor_apagado = false;
  });
  cpu.addEvent(flag_motor_apagado, function(x){
    x.send(notifica_motor_apagado);
    motor_apagado = true;
  });


  pantalla.addEvent(notifica_apertura_puerta_izda, function(x){
    coche.abrePuerta();
    console.log([x.name], "Abierta puerta izda");
  });
  pantalla.addEvent(notifica_cierre_puerta_izda, function(x){
    coche.cierraPuerta();
    console.log([x.name], "Cerrada puerta izda");
  });
  pantalla.addEvent(notifica_motor_encendido, function(x){
    coche.enciendeMotor();
    console.log([x.name], "Motor encendido");
  });
  pantalla.addEvent(notifica_motor_apagado, function(x){
    coche.apagaMotor();
    console.log([x.name], "Motor apagado");
  });
  pantalla.addEvent(notifica_alarma_error, function(x){
    coche.enciendeAlarma();
    console.log([x.name], "Error en alarma");
  });

  pantalla.addEvent(notifica_alarma_ok, function(x){
    coche.apagaAlarma();
    console.log([x.name], "Ok en alarma");
  });


  cb.connectComponent(monitor_alarma);
  cb.connectComponent(alarma);

  cb.connectComponent(cpu);

  cb.connectComponent(puerta_izda);
  cb.connectComponent(pantalla);
  cb.connectComponent(motor);


  function entra(cb){
    cb.w(abre_puerta_izda);
    setTimeout(function(){
      cb.w(cierra_puerta_izda);
    }, 1000);
  }

  function arrancaCoche(cb){
    cb.w(enciende_motor);
  }
  function paraCoche(cb){
    cb.w(apaga_motor);
  }

  function sale(cb){
    entra(cb);
  }

function main(){


  function monitor_alarma_on(){
    setTimeout(function(){
      monitor_alarma.send(check_alarma);
      if(running)
        monitor_alarma_on();
    }, 100);
  }
  monitor_alarma_on();

  setTimeout(function(){
    entra(cb);
    setTimeout(function(){
      arrancaCoche(cb);
      setTimeout(function(){
        paraCoche(cb);
        setTimeout(function(){
          sale(cb);
          setTimeout(function(){
            exit();
          }, 1000);
        }, 4000);
      }, 3000);
    }, 2000);
  }, 1500);
}

// setTimeout(main, 2000);


function ejecuta(ordenes){
  var orden = ordenes.shift();
  if(orden){
    console.log(orden);
    cb.w(Command.parse(orden));

    setTimeout(function(){
      ejecuta(ordenes);
    }, 100);
  } else {
    alert("End");
  }
}
function launchCode(){
  alert("Start");
  var ordenes = document.getElementById('ordenes').value.split('\n');
  ejecuta(ordenes);
}
document.getElementById('launch').onclick = launchCode;
document.getElementById('start').onclick = main;
