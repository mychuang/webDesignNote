const message: string = "Hello World";

function test(b: boolean): string | number {
    if(b){
        return '20';
    }else{
        return 20;
    }
} 

function say(something: string): void{
    console.log(something);
}

let nestedObject = {
    prop: 'Hello',
    child: {
      prop1: 123,
      prop2: false
    }
  };

  console.log(nestedObject);

  let aFunction = function(){
      console.log('hi');
  };

  enum week{
      w1,
      w2,
      w3
  };