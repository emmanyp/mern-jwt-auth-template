import { User } from '../models/user.js'
import { Profile } from '../models/profile.js'
import jwt from 'jsonwebtoken'

// async function signup(req, res) {
//   const profile = new Profile(req.body)
//   req.body.profile = profile._id
//   const user = new User(req.body)
//   try {
//     await user.save();
//     await profile.save();

//     const token = createJWT(user)
//     res.json({ token })
  
//   } catch (err) {
//     res.status(400).send({ err: err.errmsg })
//   }
// }

function signup(req, res) {
  Profile.findOne({ email: req.body.email })
  .then(profile => {
    if (profile) {
      throw new Error('Account already exists')
    } else {
      Profile.create(req.body)
      .then(newProfile => {
        req.body.profile = newProfile._id
        User.create(req.body)
        .then(user => {
          const token = createJWT(user)
          res.json({ token })
        })
        .catch(err => {
          res.status(500).json({err: err.errmsg})
        })
      })
    }
  })
  .catch(err => {
    res.status(500).json({err: err.message})
  })
}

function createJWT(user) {
  return jwt.sign(
    { user }, 
    process.env.SECRET,
    { expiresIn: '24h' }
  )
}

// async function login(req, res) {
//   try {
//     const user = await User.findOne({ email: req.body.email })
//     if (!user) return res.status(401).json({ err: 'User not found'})
//     user.comparePassword(req.body.pw, (err, isMatch) => {
//       if (isMatch) {
//         const token = createJWT(user)
//         res.json({ token })
//       } else {
//         return res.status(401).json({ err: 'Incorrect password' })
//       }
//     })
//   }
//   catch (err) {
//     return res.status(400).json(err)
//   }
// }

function login(req, res) {
  User.findOne({ email: req.body.email })
  .then(user => {
    if (!user) return res.status(401).json({ err: 'User not found'})
    user.comparePassword(req.body.pw, (err, isMatch) => {
      if (isMatch) {
        const token = createJWT(user)
        res.json({ token })
      } else {
        res.status(401).json({ err: 'Incorrect password' })
      }
    })
  })
  .catch(err => {
    res.status(400).json(err)
  })
}

export {
  signup,
  login
}
