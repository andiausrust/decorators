function Logger(logString: string) {
    return function(constructor: Function) {
        console.log('logging,...', logString);
        console.log('constructor', constructor);
    }
}

function WithTemplate(_template: string, _hookId: string) {
    return function<T extends {new(...args: any[]): {}}>(originalConstructor: T) {
       return class extends originalConstructor {
           constructor(..._args: any[]) {
               super();
               console.log('returned an new class based on old class!!!');
           }
       }
    }
}

@Logger('logging person')
@WithTemplate('<h1>test</h1>', 'app')
class Person {
    name = 'Max';

    constructor() {
        console.log('creating person');
    }
}

// decorators
function Log(target: any, propertyName: string | Symbol) {
    console.log('property-decorator');
    console.log('target', target);
    console.log('propertyName', propertyName);
}

function Log2(target: any, propertyName: string | Symbol, descriptor: PropertyDescriptor) {
    console.log('accessor decorator');
    console.log('target', target);
    console.log('propertyName', propertyName);
    console.log('descriptor', descriptor);
}

function Log3(target: any, propertyName: string | Symbol, descriptor: PropertyDescriptor) {
    console.log('method decorator');
    console.log('target', target);
    console.log('propertyName', propertyName);
    console.log('descriptor', descriptor);
}

function Log4(target: any, name: string | Symbol, position: number) {
    console.log('parameter decorator');
    console.log('target', target);
    console.log('name', name);
    console.log('position', position);
}



const person = new Person();

class Product {
    @Log
    title: string;
    private _price: number;

    @Log2
    set price(val: number) {
        if (val > 0) {
            this._price = val;
        }
        throw new Error('invalid price should be positive');
    }

    constructor(t: string, p: number) {
        this.title = t;
        this._price = p;
    }

    @Log3
    priceWithTax(@Log4 tax: number) {
        return this._price * (1 - tax);
    }
}

function autobind(_target: any, _name: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get(): any {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

class Printer {
    message = 'this works';

    @autobind
    showMessage() {
        console.log(this.message);
    }
}

const p = new Printer();
const button = document.querySelector('button')!;
button.addEventListener('click', p.showMessage);

// validation with decorators
interface ValidatorConfig {
    [property: string]: {
        [validateableProperty: string]: string[]
    }
}

const registeredValidators: ValidatorConfig = {}

function Required(target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propName]: ['required']
    }
}

function PositiveNumber(target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propName]: ['positive']
    }
}

function validate(obj: any) {
    const objValidatorConfig = registeredValidators[obj.constructor.name];
    if (!objValidatorConfig) {
        return true;
    }
    let isValid = true;
    for (const prop in objValidatorConfig) {
        for (const validator of objValidatorConfig) {
            switch (validator) {
                case 'required':
                    isValid = isValid && !!obj[prop];
                case 'positive':
                    isValid = isValid && obj[prop] > 0;
            }
        }
    }
    return isValid;
}


class Course {
    @Required
    title: string;
    @PositiveNumber
    price: number;

    constructor(t: string, p: number) {
        this.title = t;
        this.price = p
    }
}

const courseForm = document.querySelector('form');
courseForm.addEventListener('submit', event => {
    const titleEl = document.getElementById('title') as HTMLInputElement;
    const priceEl = document.getElementById('price') as HTMLInputElement;

    const title = titleEl.value;
    const price = +priceEl.value;

    const createdCourse = new Course(title, price);

    if (!validate(createdCourse)) {
        alert('Invalid input, please try again');
        return;
    }

    console.log(createdCourse);
});
