const form = document.querySelector('.form');
const formInputName = document.querySelector('.form__input-name');
const formInputEmail = document.querySelector('.form__input-email');
const formInputMessage = document.querySelector('.form__textarea');
const selectorTemplateCard = '.template';
const cardListSelector = ".cards";
const validationObjectForms = {
    inputSelector: '.form__input',
    submitButtonSelector: '.form__submit-button',
    inactiveButtonClass: 'form__submit-button_disabled',
    inputErrorClass: 'form__border-error',
    errorClass: 'form__error_visible'
}
class FormValidator {
    constructor(valiadationConfig, form) {
        this._inputSelector = valiadationConfig.inputSelector;
        this._submitButtonSelector = valiadationConfig.submitButtonSelector;
        this._inactiveButtonClass = valiadationConfig.inactiveButtonClass;
        this._inputErrorClass = valiadationConfig.inputErrorClass;
        this._errorClass = valiadationConfig.errorClass;
        this._form = form;
        this._submitButton = form.querySelector(valiadationConfig.submitButtonSelector);
        this._inputList = Array.from(form.querySelectorAll(valiadationConfig.inputSelector));
    }
    enableValidation() {
        this._form.addEventListener('submit', (event) => {
            event.preventDefault();
        });
        this._setFormResetListeners();
        this._setInputListeners();
    };
    _setInputListeners() {

        this._inputList.forEach(inputElement => {
            inputElement.addEventListener('input', () => {
                this._checkInput(inputElement);
                this._toggleButtonState();
            });
            this._toggleButtonState();
        })
    }
    _checkInput(inputElement) {
        if (inputElement.validity.valid) {
            this._hideInputError(inputElement);
        }
        else {
            this._showInputError(inputElement);
        }
    }
    _showInputError(inputElement) {
        const errorElement = document.querySelector(`#${inputElement.id}-error`);
        errorElement.textContent = inputElement.validationMessage;
        errorElement.classList.add(this._errorClass);
        inputElement.classList.add(this._inputErrorClass);
    };
    _hideInputError(inputElement) {
        const errorElement = document.querySelector(`#${inputElement.id}-error`);
        errorElement.classList.remove(this._errorClass);
        errorElement.textContent="";
        inputElement.classList.remove(this._inputErrorClass);
    };
    _toggleButtonState() {
        if (this._hasInvalidInput() || this._allInputsEmpty()) {
            this._submitButton.classList.add(this._inactiveButtonClass);
            this._submitButton.setAttribute('disabled', true);
        }
        else {
            this._submitButton.classList.remove(this._inactiveButtonClass);
            this._submitButton.removeAttribute('disabled');
        }
    };
    _hasInvalidInput() {
        return this._inputList.some(inputElement => {
            return !inputElement.validity.valid;
        })
    };
    _allInputsEmpty() {
        return !this._inputList.some(inputElement => {
            return inputElement.value.length > 0
        })
    };
    _setFormResetListeners() {

        this._form.addEventListener('reset', (event) => {

            this._inputList.forEach(inputElement => {
                this._hideInputError(inputElement);

            })
        })
    }
    disableSubmitButton() {
        this._submitButton.classList.add(this._inactiveButtonClass);
        this._submitButton.disbaled = true;
    }


}
class Api {
    constructor(baseUrl) {
        this._baseUrl = baseUrl;

    }
    addItem(item) {
        return fetch(`${this._baseUrl}`, {
            method: 'POST',
            body: JSON.stringify({
                name: item.name,
                email: item.email,
                message: item.message
            }),
            headers: new Headers ({

                'Content-Type': 'application/json'
            })

        }).then(res => {
            if (res.ok) {
                return res.json();
            }

            // если ошибка, отклоняем промис
            return Promise.reject(`Ошибка: ${res.status}`);
        });
    }

}
class Card {
    constructor(item, selector) {
        this._name = item.name;
        this._email = item.email;
        this._selector = selector;
        this._message = item.message;
    }
    renderCard() {
        const templateElement = document.querySelector(this._selector);
        const newItem = templateElement.content.cloneNode(true);
        const elementTitle = newItem.querySelector('.card__title');
        const elementEmail = newItem.querySelector('.card__email');
        const elementMessage = newItem.querySelector('.card__message');
        elementTitle.textContent = this._name;
        elementEmail.textContent = this._email;
        elementMessage.textContent = this._message;
        return newItem;
    }
}
class Section {
    constructor({renderer}, containerSelector) {

        this._renderer = renderer;
        this._container = document.querySelector(containerSelector);

    }
    renderer(cards) {

        for(var item in cards) {
            this._renderer(cards[item]);

        }

    }
    addItem(element) {
        this._container.prepend(element);
    }
}

function createCard(item, selector) {
    return new Card(item, selector);
}
const formValidator = new FormValidator(validationObjectForms, form);
formValidator.enableValidation();
const api = new Api('api.php');
const defaultCardList = new Section({

    renderer: (item) => {
        const card = createCard(item, selectorTemplateCard);
        const cardElement = card.renderCard();
        defaultCardList.addItem(cardElement);

    }
}, cardListSelector);
form.addEventListener('submit', (event) => {
    event.preventDefault();
    api.addItem({name: formInputName.value, email: formInputEmail.value, message: formInputMessage.value})
        .then((result) => {
            defaultCardList.renderer(result);
            form.reset();
        }).catch((err) => {
        console.log(err); // выведем ошибку в консоль
    })

});