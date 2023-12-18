const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

const options = {
    key: fs.readFileSync('/ssl/giganalyzer.key'),
    cert: fs.readFileSync('/ssl/giganalyzer_com.crt'),
};

const connect = () => {
    mongoose.connect("mongodb://127.0.0.1:27017/dataDB")
    .catch((error)=>{console.log("Error: ", error)});
}

const gigSchema = new mongoose.Schema({
  GigId: Number,
  OrdersInQueue: Number,
  Category: Object,
  Tags: Array,
  ReviewFrequency: Number,
  Competition: Number,
  Current: Date
});

const Gig = mongoose.model('Gig', gigSchema);
module.exports = Gig;

const saveDataToDB = async (d, Data) => {
    const date = new Date(d.Current);
    await Data.find({"GigId":d.GigId,"Current":{
      $gte:`${date.getFullYear()}-${date.getMonth()+1}-${date.getUTCDate()}T00:00:00.000Z`, 
      $lt:`${date.getFullYear()}-${date.getMonth()+1}-${date.getUTCDate()+1}T00:00:00.000Z`
    }}).countDocuments()
    .then(async(result)=>{
      if(result===0){
        const data = new Data(d);
        data.save()
        .catch((error)=>{console.log("Error: ", error)});
      }else{
        await Data.findOneAndUpdate({"GigId":d.GigId, "Current":d.Current}, d);
      }
    });
}

app.post('/receive-data', async (req, res) => {
    try {
        connect();
        saveDataToDB(req.body,Gig);
        res.json({'Message: ':'Data saved successfully!'});
    } catch (error) {
        res.json({'Message: ':'Data failed to save!'});
    }
});

app.get('/mvp', async (req, res) => {
    connect();
    Gig.aggregate([
        {
            $match: {
                Current: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }
        },
	{
            $group: {
            _id: {
                parentCategory: "$Category.main",
                subcategory: "$Category.sub",
                nestedCategory: "$Category.nested"
            },
            averageReviewFrequency: { $avg: "$ReviewFrequency" },
            totalSales: { $sum: "$OrdersInQueue" },
            highestCompetition: { $max: "$Competition" },
            lastUpdate: { $max: "$Current" }
            }
        },
        {
            $project: {
            _id: 0,
            parentCategory: "$_id.parentCategory",
            subcategory: "$_id.subcategory",
            nestedCategory: "$_id.nestedCategory",
            averageReviewFrequency: 1,
            totalSales: 1,
            highestCompetition: 1,
            lastUpdate: 1
            }
        },
        {
            $sort: {
            parentCategory: 1,
            subcategory: 1,
            nestedCategory: 1
            }
        }          
    ])
    .then(result=>{
        res.json(result);
    });
}); 

app.get('/all', async(rep,res)=>{
    connect();
    const all = await Gig.find({});
    res.json(all);
})

const server = https.createServer(options, app);
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
