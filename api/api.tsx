import axios from 'axios'

const API = axios.create({
    baseURL: 'https://resume-analyzer-api-518g.onrender.com/api/analyze'
})

export default  API