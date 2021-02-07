const express = require('express');
const router = express.Router();
const methodOvverride = require('method-override');
const { exec } = require("child_process");

//problems Model
const Problem = require('../models/Problem');
//solutions Model
const Solution = require('../models/Solution');
//user Model
const User = require('../models/User');
//resource Model
const User = require('../models/Resource')

const { route } = require('.');
const { ensureAuthenticated, ensureProblemOwnerShip, ensureAdmin, ensureStudent } = require('../config/auth');