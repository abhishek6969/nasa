const request = require('supertest');

const app = require('../../app.js');

const {mongoConnect , mongoDisconnect } = require("../../services/mongo");

const { loadPlanetsData } = require("../../models/planets.model");

describe("Launches API",()=>{
    beforeAll(async()=>{
        await mongoConnect();
        await loadPlanetsData();
    });
    afterAll(async()=>{
        await mongoDisconnect();
    });
    describe('Test GET /launches',() => {
        test("It Should respond with 200 success.",async () => {
            response = await request(app)
              .get("/v1/launches")
              .expect("Content-Type",/json/)
              .expect(200);
            
    
        });
    
    });
    describe('Test POST /launches',() => {
        const testData = {
            mission : "Test",
            rocket : "Test",
            launchDate : "January 4, 2050",
            target : "Kepler-62 f",
        }
        const testDataWithoutDate = {
            mission : "Test",
            rocket : "Test",
            target : "Kepler-62 f",
        }
        const testDataWithInvalidDate = {
            mission : "Test",
            rocket : "Test",
            target : "Kepler-62 f",
            launchDate : "abhi",
        }
        test("It Should respond with 201 success.",async () => {
            response = await request(app)
              .post("/v1/launches")
              .send(testData)
              .expect("Content-Type",/json/)
              .expect(201);
            
            const requestDate = new Date(testData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            
            expect(responseDate).toBe(requestDate)
            expect(response.body).toMatchObject(testDataWithoutDate);
        });
        test("It should catch missing required fields.",async ()=>{
            response = await request(app)
              .post("/v1/launches")
              .send(testDataWithoutDate)
              .expect("Content-Type",/json/)
              .expect(400);
            expect(response.body).toStrictEqual({
                error : 'Missing required information'
            })
        });
        test("It should catch invalid dates.",async () =>{
            response = await request(app)
            .post("/v1/launches")
            .send(testDataWithInvalidDate)
            .expect("Content-Type",/json/)
            .expect(400);
          expect(response.body).toStrictEqual({
              error : 'Please enter a valid date'
          })
        });
    });

})

