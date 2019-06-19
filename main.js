function newId(){
  var res = "";
  for(let i=0; i< 8; i++){
    res += Math.random() > 0.5? 1 : 0;
  }

  return res;
}

class Component {

  constructor (name, id) {
    this.id = id ? id : newId();
    this.name = name;
    this.events = {};
  }

  setCon (con) {
    this.con = con;
  }

  addEvent(command, e){
    this.events[command.code] = e;
  }

  w(command){
    if(command.id == this.id)
      if(this.events[command.code])
        this.events[command.code](this, command.extra);
  }

  send(command){
    this.con.w(command);
  }

  toString(){
    return this.name + this.id
  }
}

var cpu = new Component("cpu");
var puerta_izda = new Component("puerta_izda");

var puerta_abierta = false;

var pantalla = new Component("pantalla");
var motor = new Component("motor");
var monitor_alarma = new Component("monitor_alarma");
var alarma = new Component("alarma");

class Command {
  constructor(id, code){
    this.id = id;
    this.code = code ? code : newId();
  }
}

class CanBus  {

  constructor(){
    this.components = [];
  }

  connectComponent(c) {
    c.setCon(this);
    this.components.push(c);
  }

  w (command) {

    console.log(["CANBUS"], command.id, command.code);
    for(let i in this.components){
      this.components[i].w(command);
    }
  }

}

abre_puerta_izda = new Command(puerta_izda.id);
notifica_apertura_puerta_izda = new Command(pantalla.id);
cierra_puerta_izda = new Command(puerta_izda.id);
notifica_cierre_puerta_izda = new Command(pantalla.id);
enciende_motor = new Command(motor.id);
notifica_motor_encendido = new Command(pantalla.id);
apaga_motor = new Command(motor.id);
notifica_motor_apagado = new Command(pantalla.id);
notifica_alarma_error = new Command(pantalla.id);

flag_motor_encendido = new Command(cpu.id);
flag_motor_apagado = new Command(cpu.id);

flag_puerta_abierta = new Command(cpu.id);
flag_puerta_cerrada = new Command(cpu.id);

check_alarma = new Command(alarma.id);
alarma_ok = new Command(monitor_alarma.id);
alarma_err = new Command(monitor_alarma.id);

alarma.addEvent(check_alarma, function(x){
  if(puerta_abierta){
    x.send(alarma_err);
  } else {
    x.send(alarma_ok);
  }
});

var running = true;
function exit() {
  running = false;
}

function monitor_alarma_on(){
  setTimeout(function(){
    monitor_alarma.send(check_alarma);
    if(running)
      monitor_alarma_on();
  }, 100);
}

monitor_alarma.addEvent(alarma_ok, function(x){
});
monitor_alarma.addEvent(alarma_err, function(x){
  x.send(notifica_alarma_error);
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
});
cpu.addEvent(flag_motor_apagado, function(x){
  x.send(notifica_motor_apagado);
});



pantalla.addEvent(notifica_apertura_puerta_izda, function(x){
  console.log([x.name], "Abierta puerta izda");
});
pantalla.addEvent(notifica_cierre_puerta_izda, function(x){
  console.log([x.name], "Cerrada puerta izda");
});
pantalla.addEvent(notifica_motor_encendido, function(x){
  console.log([x.name], "Motor encendido");
});
pantalla.addEvent(notifica_motor_apagado, function(x){
  console.log([x.name], "Motor apagado");
});
pantalla.addEvent(notifica_alarma_error, function(x){
    console.log([x.name], "Error en alarma");
});

cb = new CanBus();

cb.connectComponent(monitor_alarma);
cb.connectComponent(alarma);
monitor_alarma_on();

cb.connectComponent(cpu);

cb.connectComponent(puerta_izda);
// cb.connectComponent(pantalla);
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
      }, 1000);
    }, 1000);
  }, 1000);
}, 1000);
