
import { useState } from "react";
import userService from "../services/users"
import Icon from '../images/x'

const AddNewUser = () => {
    const [newUsername, setNewUsername] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [newFirstname, setNewFirstname] = useState("")
    const [newLastname, setNewLastname] = useState("")
    const [userExists, setUserExists] = useState(false)

    function closeForm() {
        console.log("close")
        document.getElementById("addNewUser").classList.add("visuallyhidden")

        setNewUsername("")
        setNewPassword("")
        setNewFirstname("")
        setNewLastname("")
        setUserExists(false)
    }

    const saveForm = (event) => {
        event.preventDefault()
        console.log("save")

        const newUser = {
            username: newUsername,
            password: newPassword,
            firstname: newFirstname,
            lastname: newLastname
        }

        userService
            .create(newUser)
            .then(response => {
                console.log("success", response.data)
                setNewUsername("")
                setNewPassword("")
                setNewFirstname("")
                setNewLastname("")
                setUserExists(false)
            })
            .catch(error => {
                console.log(error)
                if (error.response && error.response.status === 409){
                    alert("Username already taken.")
                    setUserExists(true)
                }
            })

        console.log("saving user")

        closeForm()
    }

    const handleChange = (event) => {
        switch (event.target.id) {
            case 'username':
                setNewUsername(event.target.value)
                setUserExists(false)
                break;
            case 'firstname':
                setNewFirstname(event.target.value)
                break;
            case 'lastname':
                setNewLastname(event.target.value)
                break;
            case 'password':
                setNewPassword(event.target.value)
                break;
        }
    }

    return (
        <div id="addNewUser" className="visuallyhidden popup addNewForm">
            <header className="formHeader">
                <h2>Rekistöröidy</h2>
                <button type="button" onClick={closeForm} className="closeButton">
                    <Icon />
                </button>
            </header>
            <div className="userFormCont">
            <form onSubmit={saveForm}>
                <div>
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
                <div>
                    <label htmlFor="firstname">Etunimi</label>
                    <input
                        id="firstname"
                        type="text"
                        value={newFirstname}
                        onChange={handleChange}
                        className="formInput"
                    />
                </div>
                <div>
                    <label htmlFor="lastname">Sukunimi</label>
                    <input
                        id="lastname"
                        type="text"
                        value={newLastname}
                        onChange={handleChange}
                        className="formInput"
                    />
                </div>
                <div>
                    <label htmlFor="password">Salasana</label>
                    <input
                        id="password"
                        type="password"
                        value={newPassword}
                        onChange={handleChange}
                        className="formInput"
                    />
                </div>
                <button type="submit" className="button center">Tallenna</button>
            </form>
            </div>
        </div>
    )
}

export default AddNewUser