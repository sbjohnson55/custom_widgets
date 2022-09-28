const template = document.createElement('template');
template.innerHTML = `
    <style>
    .user-card{
        font-family: 'Arial', sans-serif;
        background: #f4f4f4;
        width: 500px;
        display: grid;
        grid-template-columns: 1fr 2fr;
        grid-gap:10px;
        margin-bottom:15px;
        border-bottom: darkorchid 5px solid;
    }

    .user-card img{
        width:100%;
    }

    .user-card button {
        cursor:pointer;
        background: darkorchid;
        color: #fff;
        border:0;
        border-radius:5px;
        padding: 5px 10px;
    }

    </style>
    <div class="user-card">
        <img />
        <div>
            <h3></h3>
            <div class="info">
                <p id="email"></p>
                <p id="phone"></p>
            </div>
            <button id="toggle-info">Hide Info</button>
        </div>
    </div>
`;

class UserCard extends HTMLElement{
    constructor(){
        super();
        this.showInfo = true;
        this.attachShadow({mode:'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._name = this.shadowRoot.querySelector('h3');
        this._avatar= this.shadowRoot.querySelector('img');
        this._email = this.shadowRoot.querySelector('#email');
        this._phone = this.shadowRoot.querySelector('#phone');
        
    }
    toggleInfo(){
        this.showInfo = !this.showInfo;
        const info = this.shadowRoot.querySelector('.info');
        const toggleBtn = this.shadowRoot.querySelector('#toggle-info');
        if(this.showInfo){
            info.style.display = 'block';
            toggleBtn.innerText='Hide Info';
        }else{
            info.style.display = 'none';
            toggleBtn.innerText='Show Info';
        }
    }

    setName(newName) {
		this._name.innerText = newName;
		// fire "properties changed"
		this.dispatchEvent(new CustomEvent("propertiesChanged", {
			detail: {
				properties: {
					name: this._name
			}
		}
    }));
	}

	getName() {
		return this._name;
	}

    setAvatar(url) {
		this._avatar.src = url;
		// fire "properties changed"
		this.dispatchEvent(new CustomEvent("propertiesChanged", {
			detail: {
				properties: {
					avatar: this._avatar
			}
		}
    }));
	}

	getAvatar() {
		return this._avatar;
	}

    setEmail(email) {
		this._email.innerText = email;
		// fire "properties changed"
		this.dispatchEvent(new CustomEvent("propertiesChanged", {
			detail: {
				properties: {
					email: this._email
			}
		}
    }));
	}

	getEmail() {
		return this._email;
	}

    setPhone(phone) {
		this._phone.innerText = phone;
		// fire "properties changed"
		this.dispatchEvent(new CustomEvent("propertiesChanged", {
			detail: {
				properties: {
					phone: this._phone
			}
		}
    }));
	}

	getPhone() {
		return this._phone;
	}


    connectedCallback(){
        this.shadowRoot.querySelector('#toggle-info').addEventListener('click',()=>this.toggleInfo());
    }
    disconnectedCallback(){
        this.shadowRoot.querySelector('#toggle-info').removeEventListener();
    }
}

window.customElements.define('user-card',UserCard);