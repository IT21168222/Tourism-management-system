import sellerPost from '../Models/SellerPost-model.js'

export const addNewPost = async (req, res) => {
    console.log(req.body)

    try {
        let file = 'N/A'
        if (req.file) {
            file = req.file.filename
        }

        const prefix = 'TID'
        const tripID = (prefix + Date.now());
   

        const data = req.body
        const post = new sellerPost({
            Trip_ID : tripID,
            Seller_ID: data.Seller_ID,
            Trip_Name:data.Trip_Name,
            No_Of_Days: data.No_Of_Days,
            Price:data.Price,
            Accomodation:data.Accomodation,
            Meals:data.Meals,
            Transport:data.Transport,
            About_Trip:data.About_Trip,
            What_will_You_Do:data.What_will_You_Do,
            Thumbnail:file,
            Images:null,
            Destinations:data.Destinations,
            Activities:data.Activities

        })

        const newpost = await post.save()
        if(newpost){
            res.status(201).json({
                message: "Data adding successfull..!",
                payload: newpost
            })
        }else {
            res.status(401).json({
              message: "Somthing Went Wrong In data adding..!"
            })
          }



    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Somthing Went Wrong..!",
            error: error
        })
    }
}

export const uploadImages = async (req, res) => {
  console.log(req.body)
    try {
      const id = { Trip_ID: req.body.Trip_ID }
      let images = []

      if (Array.isArray(req.body.Images) && req.body.Images.length > 0) {
      images = req.body.Images.map((file) => {
        if (file && typeof file.name === "string") {
          return {
            img: Date.now() + "_" + file.name,
          };
        } else {
          throw new Error("Invalid file format");
        }
      });
    }
  
      const newImages = {
        Images: images
      }
      const updateimgs = await sellerPost.findOneAndUpdate(id, newImages, { new: true });

      if (updateimgs) {
        const newdetails =  await sellerPost.find({Trip_ID: req.body.Trip_ID})
        res.status(201).json({
          message: "Images updated..!",
          payload: newdetails
        })
      } else {
        res.status(400).json({
          message: "Images Update failed..!",
        })
      }
  
    } catch (error) {
      res.status(500).json({
        message: "Somthing Went Wrong..!",
      })
    }
  }

  export const getPost = async (req, res) => {
    console.log(req.body)
    try {
      const posts = await sellerPost.find({Seller_ID : req.body.Seller_ID})
      if (posts) {
        res.status(200).json({
          message: "Success..!!",
          payload: posts
        });
      } else {
        res.status(404).json({
          message: "Error...!"
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  };

  export const deletePost = async (req, res) => {
    console.log(req.body);
    try {
      const success = await sellerPost.findOneAndDelete({ Trip_ID: req.body.Trip_ID });
  
      if (success) {
        const newPosts = await sellerPost.find({ Seller_ID: req.body.Seller_ID });
  
        res.status(200).json({
          message: "Deleted..!",
          payload: newPosts
        });
      } else {
        res.status(400).json({
          message: "Error..!"
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Server Error..!"
      });
    }
  };
  

  export const getOnePost = async (req, res) => {
    console.log(req.body)
    try {
      const posts = await sellerPost.find({Trip_ID : req.body.Trip_ID})
      if (posts) {
        res.status(200).json({
          message: "Success..!!",
          payload: posts
        });
      } else {
        res.status(404).json({
          message: "Error...!"
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  };

  //  for frontend all post

  export const getAllPost = async (req, res) => {
    console.log(req.body)
    try {
      const posts = await sellerPost.find()
      if (posts) {
        res.status(200).json({
          message: "Success..!!",
          payload: posts
        });
      } else {
        res.status(404).json({
          message: "Error...!"
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  };
