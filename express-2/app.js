//Se llama al modulo mongoose para poder manejar la base de datos
const mongoose = require("mongoose");
//Se crea la conexion que es una promesa

mongoose
  .connect("mongodb://localhost:27017/demo")
  .then(() => console.log("Conectado a la base de datos"))
  .catch((err) =>
    console.log("No se pudo conectar con la base de datos.. ", err)
  );
//Se crea un esquema que se puede decir es el modelo que va a tener el documento para los datos
const cursoSchema = new mongoose.Schema({
  nombre: String,
  autor: String,
  etiquetas: [String],
  fecha: { type: Date, default: Date.now },
  publicado: Boolean,
});


//Se creo un modelo el cual utilizara el esquema como plantilla para poder asignar los datos
const Curso = new mongoose.model("Curso", cursoSchema);
//Se crea un promesa para esperar a que la solicitud que cumpla

async function listarCursos(){
    // eq (equal, igual)
    // ne (not equal, no igual)
    // gt (greater than, mayor que)
    // gte (greater than or egual to, mayor o igual que)
    // lt (less than, menor que)
    // lte (less than or equal to, menor o igual que)
    // in
    // nin (not in)
    // or
    // and
    const numeroPage = 2;
    const sizePage = 10;
    // api/cursos?numeroPage=4&sizePage=10
    const cursos = await Curso
        //.find({publicado: true})
        //.find({ precio: {$gte:10, $lte:30}})
        //.find({precio: {$in: [10, 15, 25]}})
        //.find()
        //.and([{autor:'Grover'}, {publicado: false}])
        // Empiece con la palabra Gro
        //.find({ autor: /^Gro/ })
        // Cuando termina en una palabra o expresion
        //.find({ autor: /verr$/ })
        //Cuando un campo tiene un contenido específico        
        .find( { autor: /.*ro.* / })
        .skip((numeroPage - 1) * sizePage)
        .limit(sizePage)
        .sort({autor: -1})
        .select({autor:1, nombre:1, etiquetas:1});
    console.log(cursos);
}
//listarCursos();

async function actualizarCurso(id){
    // const curso = await Curso.findById(id);
    // if(!curso) {
    //     console.log('El curso no existe');
    //     return;
    // }
    // curso.publicado = false;
    // curso.autor = 'Grover Vásquez';

    // curso.set({
    //     publicado: false,
    //     autor: 'Grover Vásquez'
    // })
    // const resultado = await curso.save();
    // console.log(resultado);
    const resultado = await Curso.findByIdAndUpdate(id,{
        $set: {
            autor:'Luiz',
            publicado: true
        }
    }, { new: true });
    console.log(resultado);
}
//actualizarCurso('5da52e69b7d451b75d924eac');
 async function eliminarDocumento(id){
    const result = await Curso.deleteOne({ _id:id });
    //const resultado = await Curso.findByIdAndDelete(id);
    console.log(result);
 }
 eliminarDocumento('5da52e69b7d451b75d924eac');
