import {describe, it} from 'mocha'

describe("database tests", () => {
    describe("creation test", () => {
        it("should create an accessible database")
        it("should create a file for the database")
        it("should throw 'path is directory' error")
    })
    describe("#set()", () => {
        it("append to the file and not throw an error")
    })
    describe("#get()", () => {
        it("should read through the file and return a match")
        it("should read through the file and not return a match")
    })
    describe("#has()", () => {
        it("should read through the file and find a match")
        it("should read through the file and not find a match")
    })
    describe("#remove()", () => {
        it("should remove an entry from the file")
        it("should not remove a non existen entry")
    })
})