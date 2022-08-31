import { GithubUser } from "./github-user.js" 

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)

    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@gitfav-challenge")) || []
  }

  save() {
    localStorage.setItem("@gitfav-challenge", JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error(`Usuário "${username}" já cadastrado!`)
      }

      const user = await GithubUser.search(username)
      
      if(user.login === undefined) {
        
        if(this.entries.length === 0) {
          console.log(user.login)
          this.changeScreen()
        }

        throw new Error(`Usuário "${username}" não encontrado!`)
      }
      

      this.entries = [user, ...this.entries]

      this.update()
      this.save()

    } catch(error) {
      alert(error.message)

    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)
    this.entries = filteredEntries

    if(this.entries.length === 0) {
      this.changeScreen()
    }

    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    this.tbody = this.root.querySelector("table tbody")

    this.update()
    this.onAdd()
  }

  changeScreen() {
    const screenOne = this.root.querySelector(".screen1")
    const screenTwo = this.root.querySelector(".screen2")

    if(this.entries.length === 0) {
        screenOne.classList.toggle("hide")
        screenTwo.classList.toggle("hide")
    }
  }

  onAdd() {
    const buttonAdd = this.root.querySelector("#gitfav-add")
    buttonAdd.addEventListener("click", () => {
      const { value } = this.root.querySelector("#input-search")

      if(this.entries.length === 0) {
        this.changeScreen()
      }

      this.add(value)

      this.update();
      this.save();
    })
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()
      
      row.querySelector(".user img").src = `https://github.com/${user.login}.png`
      row.querySelector(".user img").alt = `Imagem de ${user.name}`
      row.querySelector(".user p").textContent = `${user.name}`
      row.querySelector(".user a").href = `https://github.com/${user.login}`
      row.querySelector(".user a").textContent = `/${user.login}`
      row.querySelector(".repositories").textContent = user.public_repos
      row.querySelector(".followers").textContent = user.followers

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm(`Tem certeza que deseja excluir o usuário "${user.login}"?`)
        if(isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement("tr")

    tr.innerHTML = `
      <td class="user">
        <div class="user-profile">
            <img src="https://github.com/maykbrito.png" alt="Imagem de Mayk Brito">
            <div class="user-name">
              <p>Mayk Brito</p>
              <a href="https://github.com/maykbrito" target="_blank">/maykbrito</a>
            </div>
        </div>
      </td>
      <td class="repositories">123</td>
      <td class="followers">1234</td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach( (tr) => {
      tr.remove()
    })
  }
}