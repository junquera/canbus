class Component {

  constructor (id, name){
    this.id = id;
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
      this.events[command.code](this);
  }

  send(command){
    this.con.w(command);
  }
}


puerta_izda = new Component(0, "puerta_izda");
pantalla = new Component(1, "pantalla");
motor = new Component(2, "motor");


class Command {
  constructor(id, code){
    this.id = id;
    this.code = code;
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
    console.log(command.id, command.code);
    for(let i in this.components){
      this.components[i].w(command);
    }
  }

}

abre_puerta_izda = new Command(puerta_izda, 0);
notifica_apertura_puerta_izda = new Command(pantalla, 0);
cierra_puerta_izda = new Command(puerta_izda, 0);
notifica_cierre_puerta_izda = new Command(pantalla, 0);
enciende_motor = new Command(motor, 0);
notifica_motor_encendido = new Command(pantalla, 1);
apaga_motor = new Command(motor, 1);
notifica_motor_apagado = new Command(pantalla, 2);


puerta_izda.addEvent(abre_puerta_izda, function(x){
  this.send(notifica_apertura_puerta_izda);
});
pantalla.addEvent(notifica_apertura_puerta_izda, function(x){
  console.log(x.name, "Abierta puerta izda");
});

cb = new CanBus();
cb.connectComponent(puerta_izda);
cb.w(abre_puerta_izda);
