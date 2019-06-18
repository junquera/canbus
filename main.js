// class Monitor {
//
// }

class Event {
  constructor(name, callback){
    this.name = name;
    this.callback = callback;
  }

  launch(c){
    this.callback(c);
  }
}

class Command {
  constructor(id, code){
    this.id = id;
    this.code = code;
  }
}

class Component {
  constructor(nombre, id){
    this.nombre = nombre;
    this.id = id;
    this.events = {}
  }

  addEvent(e, command){
    this.events[command.code] = e;
  }

  triger (command){
    if(this.id == command.id && this.events[command.code]){
      this.events[command.code].launch(this);
    }
  }
}

class Monitor {
  constructor (){
    this.components = [];
  }

  addComponent(component){
    this.components.push(component);
  }

  trigger(c){
    for(let i in this.components)
      this.components[i].triger(c);
  }

}

m = new Monitor();
puerta = new Component('puerta_izda', 0);
c = new Command(0, 0);
abrir_puerta = new Event('abrir', function(puerta){
  console.log("abierta", puerta.nombre);
});

puerta.addEvent(abrir_puerta, c);
m.addComponent(puerta);
m.trigger(c);

console.log(m.components);
