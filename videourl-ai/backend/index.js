import express from 'express'
import uniqid from 'uniqid'
import fs from 'fs'
import cors from 'cors'
import { GPTScript, RunEventType } from '@gptscript-ai/gptscript'
import 'dotenv/config';


const app = express();
app.use(cors());
//const g = new G4F();
const g = new GPTScript({
   apiKey: process.env.OPENAI_API_KEY // Pass the API key here
});


app.get('/test',(req,res) => {
    return res.json("ALl Gooofsssssffffffffffd ");
});

app.get('/create-story', async (req,res) => {
    const url=decodeURIComponent(req.query.url);
    const dir=uniqid();
    const path='./stories/'+dir;
    fs.mkdirSync(path,{recursive:true});
    console.log({
        url,
    });
    
const opts = {      //options 
    input: `--url ${url} --dir ${path}`,
    disableCache: true,
};

try{
    console.log("about to run chatgpt")
    const run=await g.run('./story.gpt',opts);
    console.log("awaiting results")

    run.on(RunEventType.Event, ev =>{
        if(ev.type === RunEventType.CallFinish && ev.output){
            console.log(ev.output);
        }
    });
    const result = await run.text();
    return res.json(dir);
}catch(e){
    console.error(e);
    return res.json('error');
}

});


app.listen(8080, () => 
    console.log('Server is running on port 8080')
);