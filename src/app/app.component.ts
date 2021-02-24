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
export class PizzaOrder extends Serializable {
  static clientType = "pizzaorder";
  sizes: Size[] = [];
  tops: Topping[] = [];
  offers: Offer[] = [];
}

@classDecorator()
export class Size extends Serializable {
  static clientType = "size";
  name: string;
  price: string;
}

@classDecorator()
export class Topping extends Serializable {
  static clientType = "tops";
  vetops: VegOptions[] = [];
  nonvegtops: NonVegoptions[] = [];
}

@classDecorator()
export class VegOptions extends Serializable {
  static clientType = "vegtop";
  name: string;
  price: string;
}

@classDecorator()
export class NonVegoptions extends Serializable {
  static clientType = "nonvegtop";
  name: string;
  price: string;
}

@classDecorator()
export class Offer extends Serializable {
  static clientType = "promotional";
  name: string;
  price: string;
}

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  public msg: string;
  ngOnInit() {
    const json = {
      clientType: "pizzaorder",
      sizes: [
        { clientType: "size", name: "Small", price: "$5" },
        { clientType: "size", name: "Medium", price: "$7" },
        { clientType: "size", name: "Large", price: "$8" },
        { clientType: "size", name: "ExtraLarge", price: "$9" }
      ],
      tops: {
        clientType: "tops",
        VegOptions: [
          { clientType: "vegtop", name: "Tomatoes", price: "$1.00" },
          { clientType: "vegtop", name: "Onions", price: "$0.50" },
          { clientType: "vegtop", name: "Bellpepper", price: "$1.00" },
          { clientType: "vegtop", name: "Mushrooms", price: "$1.20" },
          { clientType: "vegtop", name: "Pineapple", price: "$0.75" }
        ],
        NonVegoptions: [
          { clientType: "nonvegtop", name: "Sausage", price: "$1.00" },
          { clientType: "nonvegtop", name: "Pepperoni", price: "$2.00" },
          { clientType: "nonvegtop", name: "Barbecuechicken", price: "$3.00" }
        ]
      },
      offers: [
        {
          clientType: "promotional",
          name: "1 Medium Pizza with 2 toppings",
          price: "$5"
        },
        {
          clientType: "promotional",
          name: "2 Medium Pizza with 4 topping each",
          price: "$9"
        },
        {
          clientType: "promotional",
          name:
            "1 Large with 4 toppings (Peperoni and Barbecue chicken are counted as 2 toppings)",
          price: "-50%"
        }
      ]
    };

    const instance = ClassResolver.ResolveObject(json) as PizzaOrder;
    console.log(instance);
    this.msg = instance.sizes[0].name;
    //console.log(instance.sizes[0]);
  }
}
