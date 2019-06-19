

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
    if(this.con)
      this.con.w(command);
  }

  toString(){
    return this.name + this.id
  }
}

class Command {
  constructor(id, code){
    this.id = id;
    this.code = code ? code : newId();
  }

  static parse(text){
    return new Command(text.substr(0,8),text.substr(8,8));
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

    console.error(["CANBUS"], command.id, command.code);
    // console.log(command.id + command.code);
    for(let i in this.components){
      this.components[i].w(command);
    }
  }

}
