import designers from "../../data/designers.json";
import DesignerPage from "../../components/DesignerPage";

export default function DayPage({ designer, allDesigners }) {
  return <DesignerPage designer={designer} allDesigners={allDesigners} />;
}

export async function getStaticPaths() {
  return {
    paths: designers.map((d) => ({ params: { slug: d.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const designer = designers.find((d) => d.slug === params.slug);
  return {
    props: {
      designer,
      allDesigners: designers,
    },
  };
}
