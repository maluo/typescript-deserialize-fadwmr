import { Component, OnInit } from "@angular/core";

export abstract class Serializable {
  static clientType: string;

  deserialize(input: Object) {
    Object.keys(input).forEach(key => {
      const value = input[key];
      switch (typeof value) {
        case "object":
          this[key] = ClassResolver.ResolveObject(value);
          break;
        default:
          this[key] = value;
          break;
      }
    });
    return this;
  }
}

export class ClassResolver {
  public static TypeDictionary = {};

  public static ResolveObject(object) {
    if (Array.isArray(object)) {
      return object.map(item => this.ResolveObject(item));
    }

    const clientType = object.clientType;
    if (!clientType || !this.TypeDictionary[clientType]) {
      Object.keys(object).forEach(key => {
        if (typeof object[key] === "object") {
          object[key] = this.ResolveObject(object[key]);
        }
      });
      return object;
    }
    const targetType = this.TypeDictionary[clientType];
    return new targetType().deserialize(object);
  }
}

function classDecorator(): any {
  return function(
    target: any,
    name: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    ClassResolver.TypeDictionary[target.clientType] = target;
    // console.log(target, name, clientType);
  };
}

@classDecorator()
export class Member extends Serializable {
  static clientType = "memberClientType";
  id: number;
  getToto() {
    return "toto";
  }
}

@classDecorator()
export class ExampleClass extends Serializable {
  static clientType = "exampleClassClientType";
  mainId: number;
  firstMember: Member;
  secondMember: Member;
  thirdMember: Member[] = [];
  randomMember: { [index: string]: Member } = {};
  myMethod() {
    return "method";
  }
}

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  ngOnInit() {
    console.log(ClassResolver.TypeDictionary);

    const json = {
      clientType: "exampleClassClientType",
      mainId: 42,
      firstMember: {
        clientType: "memberClientType",
        id: 1337
      },
      secondMember: {
        clientType: "memberClientType",
        IDs: -1
      },
      thirdMember: [
        { clientType: "memberClientType", id: 1 },
        { clientType: "memberClientType", id: 2 }
      ],
      randomMember: {
        toto: { clientType: "memberClientType", id: 1 },
        tata: { clientType: "memberClientType", id: 2 }
      }
    };

    const instance = ClassResolver.ResolveObject(json) as ExampleClass;
    console.log(instance);
    console.log(instance.thirdMember[0].getToto());
  }
}
