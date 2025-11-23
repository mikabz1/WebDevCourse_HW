document.addEventListener("DOMContentLoaded", () => {

    pageLoaded();
    //...
});

let txt1;
let txt2;
let btn;
let lblRes;
let operation;
function pageLoaded() {
    txt1 = document.getElementById('txt1');
    txt2 = document.querySelector('#txt2');
    btn = document.getElementById('btnCalc');
    lblRes = document.getElementById('lblRes');
    operation = document.getElementById('operation');
    btn.addEventListener('click', () => {
        calculate();
    });

    // Add validation listeners for input fields
    txt1.addEventListener('input', () => {
        validateInput(txt1);
    });
    txt1.addEventListener('blur', () => {
        validateInput(txt1);
    });

    txt2.addEventListener('input', () => {
        validateInput(txt2);
    });
    txt2.addEventListener('blur', () => {
        validateInput(txt2);
    });

}

function validateInput(inputElement) {
    const value = inputElement.value.trim();
    
    // Check if value is empty or not a valid number
    if (value === '' || isNaN(value) || value === null) {
        // Remove is-valid, add is-invalid
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
    } else {
        // Remove is-invalid, add is-valid
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
    }
}

function calculate() {
    let txt1Text = txt1.value;
    let num1 = parseInt(txt1Text);

    let txt2Text = txt2.value;
    let num2 = parseInt(txt2Text);

    let selectedOperation = operation.value;
    let operationSymbol = operation.options[operation.selectedIndex].text;
    let res;
    
    switch(selectedOperation) {
        case '+':
            res = num1 + num2;
            break;
        case '-':
            res = num1 - num2;
            break;
        case '*':
            res = num1 * num2;
            break;
        case '/':
            res = num2 !== 0 ? num1 / num2 : 'Error: Division by zero';
            break;
        default:
            res = num1 + num2;
    }
    
    lblRes.innerText = res;
    
    // Log the calculation to the output textarea
    let logEntry = `${num1} ${operationSymbol} ${num2} = ${res}`;
    print(logEntry, true);



}





const btn2 = document.getElementById("btn2");
btn2.addEventListener("click", () => {
    print("btn2 clicked :" + btn2.id + "|" + btn2.innerText);
});


// btn2.addEventListener("click",func1);

// function func1()
// {

// }
function print(msg, append = false) {

    //--Get TextArea Element Reference
    const ta = document.getElementById("output");
    //--Write msg to textArea text
    if (ta) {
        if (append) {
            // Add new line and append to existing text
            ta.value = ta.value + (ta.value ? "\n" : "") + msg;
        } else {
            // Replace existing text
            ta.value = msg;
        }
    }
    //write Log
    else console.log(msg);
}



// =============================================
// STEP 1: JS NATIVE TYPES, USEFUL TYPES & OPERATIONS
// =============================================
function demoNative() {
    let out = "=== STEP 1: NATIVE TYPES ===\n";

    // String
    const s = "Hello World";
    out += "\n[String] s = " + s;
    out += "\nLength: " + s.length;
    out += "\nUpper: " + s.toUpperCase();

    // Number
    const n = 42;
    out += "\n\n[Number] n = " + n;

    // Boolean
    const b = true;
    out += "\n\n[Boolean] b = " + b;

    // Date
    const d = new Date();
    out += "\n\n[Date] now = " + d.toISOString();

    // Array
    const arr = [1, 2, 3, 4];
    out += "\n\n[Array] arr = [" + arr.join(", ") + "]";
    out += "\nPush 5 → " + (arr.push(5), arr.join(", "));
    out += "\nMap x2 → " + arr.map(x => x * 2).join(", ");

    // Functions as variables
    const add = function (a, b) { return a + b; };
    out += "\n\n[Function as variable] add(3,4) = " + add(3, 4);

    // Callback
    function calc(a, b, fn) {
        return fn(a, b);

    }
    const result = calc(10, 20, (x, y) => x + y);
    out += "\n[Callback] calc(10,20, x+y ) = " + result;

    //Print to Log
    print(out);
}