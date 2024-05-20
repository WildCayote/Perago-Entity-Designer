
export const importPattern = {
    "default": {
        appModule : {
            modulePattern: "./modules",
            entityPattern: "./entities",
            
        },
        controller: {
            dtoPattern: "../../dtos",
            servicePattern: "../services",
        },
        module: {
            controllerPattern: "./controllers",
            entityPattern: "src/entities",
            servicePattern: "./services",            
        },
        service: {
            dtoPattern: "../../dtos",
            entityPattern: "../../entities",
        }

    },
    "layered": {
        appModule : {
            modulePattern: "src/modules",
            entityPattern: "src/entities",
            
        },
        controller: {
            dtoPattern: "src/dtos",
            servicePattern: "src/services",
        },
        module: {
            controllerPattern: "src/controllers",
            entityPattern: "src/entities",
            servicePattern: "src/services",            
        },
        service: {
            dtoPattern: "src/dtos",
            entityPattern: "src/entities",
        }
    }
}