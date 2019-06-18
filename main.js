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


puerta_izda = new Component("puerta_izda");
pantalla = new Component("pantalla");
motor = new Component("motor");


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


puerta_izda.addEvent(abre_puerta_izda, function(x){
  x.send(notifica_apertura_puerta_izda);
});

puerta_izda.addEvent(cierra_puerta_izda, function(x){
  x.send(notifica_cierre_puerta_izda);
});

pantalla.addEvent(notifica_apertura_puerta_izda, function(x){
  console.log([x.name], "Abierta puerta izda");
});
pantalla.addEvent(notifica_cierre_puerta_izda, function(x){
  console.log([x.name], "Abierta puerta izda");
});

motor.addEvent(enciende_motor, function(x){
  x.send(notifica_motor_encendido);
});
motor.addEvent(apaga_motor, function(x){
  x.send(notifica_motor_apagado);
});

pantalla.addEvent(notifica_motor_encendido, function(x){
  console.log([x.name], "Motor encendido");
});
pantalla.addEvent(notifica_motor_apagado, function(x){
  console.log([x.name], "Motor apagado");
});

cb = new CanBus();
cb.connectComponent(puerta_izda);
cb.connectComponent(pantalla);
cb.connectComponent(motor);

function entra(cb){
  cb.w(abre_puerta_izda);
  cb.w(cierra_puerta_izda);
}
function arrancaCoche(cb){
  cb.w(enciende_motor);
}
function paraCoche(cb){
  cb.w(apaga_motor);
}

function sale(cb){
  cb.w(abre_puerta_izda);
  cb.w(cierra_puerta_izda);
}

entra(cb);
sale(cb);
