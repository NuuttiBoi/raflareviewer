import { useState } from "react"
import userService from "../services/users"
import Icon from '../images/x'

const AddNewLogin = ({ setIsLoggedIn }) => {
    const [newUsername, setNewUsername] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [userExists, setUserExists] = useState(false)

    function closeForm() {
        console.log("close")
        document.getElementById("addNewLogin").classList.add("visuallyhidden")

        setNewUsername("")
        setNewPassword("")
        setUserExists(false)
    }

    const saveForm = (event) => {
        event.preventDefault()
        console.log("save")

        const newUser = {
            username: newUsername,
            password: newPassword,
        }

        userService
            .login(newUser)
            .then(response => {
                console.log("success", response)
                setNewUsername("")
                setNewPassword("")
                setUserExists(false)
                setIsLoggedIn(true)
            })
            .catch(error => {
                console.log(error)
                if (error.response && error.response.status === 401){
                    alert("Wrong username/password.")
                    setUserExists(true)
                }
            })

        console.log("saving login")

        closeForm()

    }

    const handleChange = (event) => {
        switch (event.target.id) {
            case 'username':
                setNewUsername(event.target.value)
                setUserExists(false)
                break;
            case 'password':
                setNewPassword(event.target.value)
                break;
        }
    }

    const openUser = (event) => {
        event.preventDefault()
        document.getElementById("addNewUser").classList.remove("visuallyhidden")
        console.log("open form")
        closeForm()
    }

    return (
        <div id="addNewLogin" className="visuallyhidden popup addNewForm">
            <header className="formHeader">
                <h2>Kirjaudu Sisään</h2>
                <button type="button" onClick={closeForm} className="closeButton">
                    <Icon/>
                </button>
            </header>
            <div className="loginFormCont">
            <form onSubmit={saveForm}>
                <div className="usernameInput">
                    <label htmlFor="username">Käyttäjänimi</label>
                    <input
                        id="username"
                        type="text"
                        value={newUsername}
                        onChange={handleChange}
                        className="formInput"
                    />
                    {userExists && <div style={{color: 'red'}}> Username already taken</div>}
                </div>
                <div className="passwordInput">
                    <label htmlFor="password">Salasana</label>
                    <input
                        id="password"
                        type="password"
                        value={newPassword}
                        onChange={handleChange}
                        className="formInput"
                    />
                </div>
                <button type="button" onClick={openUser} className="userBtn"> Luo tili</button>
                <button id="submitBtn" type="submit" className="button center">Tallenna</button>
            </form>
            </div>
        </div>

    )
}

export default AddNewLogin