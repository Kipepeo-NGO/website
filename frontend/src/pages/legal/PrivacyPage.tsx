import SectionPage from '@/pages/common/SectionPage';

export default function PrivacyPage({ meta }: { meta?: any }) {
  return (
    <SectionPage meta={meta}>
      <div className="space-y-4 text-gray-800">
        <p className="font-semibold">Aviso legal y política de privacidad</p>
        <p>
          Responsable: Asociación Kipepeo (en adelante, “Kipepeo”). Domicilio: Plaza Fernando Ceballos n.º 3, Villafranca
          de los Barros (Badajoz). Teléfono: +34 633 78 59 75. Email: info@kipepeo.ngo. Inscripción: n.º 8576, sección 1
          del Registro de Asociaciones de la Consejería de Hacienda y Administraciones Públicas de la Junta de
          Extremadura. CIF: G22502702.
        </p>

        <p>
          La web https://www.kipepeo.ngo contiene información sobre la asociación y sus actividades. El acceso implica
          un uso de buena fe y ajustado a derecho; no se permiten conductas que lesionen derechos de terceros.
        </p>

        <p>
          Kipepeo no responde de contenidos publicados por terceros en foros o redes, pero retirará o bloqueará aquellos
          que vulneren la normativa. Tampoco se responsabiliza de fallos derivados de software o conexiones del usuario,
          ni garantiza ausencia de interrupciones. Puede actualizar, modificar o eliminar información del sitio sin previo
          aviso.
        </p>

        <p className="font-semibold">Propiedad intelectual</p>
        <p>
          Los contenidos accesibles en https://www.kipepeo.ngo están sujetos a derechos de propiedad intelectual. La
          información remitida (comentarios, sugerencias, ideas) se considera cedida a Kipepeo de forma gratuita.
        </p>

        <p className="font-semibold">Protección de datos personales</p>
        <p>
          Datos recogidos: identificativos y de contacto al enviar formularios (donación, newsletter, contacto, altas de
          socio/voluntariado/viajes). Finalidad: gestionar relaciones con socios, colaboradores, donantes o suscriptores y
          enviar comunicaciones relacionadas con la misión de Kipepeo. Base legal: consentimiento, ejecución de
          relaciones contractuales y cumplimiento normativo.
        </p>
        <p>
          Derechos: acceso, rectificación, supresión, portabilidad, limitación y oposición. Puedes ejercerlos por escrito o
          por email a info@kipepeo.ngo, indicando el derecho ejercido y adjuntando copia de documento identificativo.
        </p>
        <p>
          Seguridad: Kipepeo aplica medidas técnicas y organizativas para proteger los datos frente a pérdida, alteración o
          acceso no autorizado. Se informa a las personas que tratan datos del deber de confidencialidad.
        </p>
      </div>
    </SectionPage>
  );
}
