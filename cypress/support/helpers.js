import { faker } from '@faker-js/faker'

export function getRandomNumber(){
    return faker.number.hex()
}

export function getRandomEmail(){
    return `qa-tester-${getRandomNumber()}@test.com`
}