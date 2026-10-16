import React,{useState} from "react";
import "../auth.form.scss";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth.js";

const Login = () => {
     const {loading,handleLogin} = useAuth()
     const [email,setEmail] = React.useState("")
     const [password,setPassword] = React.useState("")
     const navigate = useNavigate()


     const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("LOGIN BUTTON CLICKED");
        
        await handleLogin(email,password)
        console.log("LOGIN FUNCTION FINISHED");
        navigate("/")

     }
     if(loading){
        return (<main>
            <h1>Loading...</h1>
        </main>

        )
     }


  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>

        <form onSubmit = {handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
            />
          </div>

          <button className="button primary-button" type="submit">
            Login
          </button>
        </form>
          <p> Dont   have an account? <Link to= {"/register"}>Register</Link></p>
      </div>
    </main>
  );
};

export default Login;