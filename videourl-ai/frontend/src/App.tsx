import {  FormEvent, useState } from "react" 

function App() {
  const [url,setUrl]= useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    console.log("url submitted",url);
  };
  


  return (
    <>
      <main className="max-w-2xl mx-auto flex gap-16 px-4"> 
      <div className="py-8 flex flex-col justify-center">
        <h1 className="text-4xl font-bold uppercase mb-4">
          <span className="text-5xl">
            URL TO VIDEO
          </span>
            <br />
            <span className="bg-gradient-to-br from bg-emerald-300 from-30% to-sky-300 bg-clip-text text-transparent">
              WITH POWER OF AI            
          </span>
        </h1>
        <form 
        onSubmit={handleSubmit}
        className="grid gap-2">
          <input 
          className="border-2 rounded-full bg-transparent text-white px-4 py-2 grow"
          value={url}
          onChange={ev=>setUrl(ev.target.value)}
          type="url"
          placeholder="https://..." />
          <button
          className="bg-emerald-500 text-white px-4 py-2 rounded-full uppercase"
          type="submit"
          >Create&nbsp;Video</button>
        </form>
      </div>
      <div>
        <div>
          <video src="">

          </video>
        </div>
      </div>
      </main> 

    </>
  )
}

export default App
