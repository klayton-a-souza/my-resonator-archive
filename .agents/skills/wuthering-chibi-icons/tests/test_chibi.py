import base64
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import importlib.util
from io import BytesIO
from PIL import Image

PY = Path(__file__).resolve().parents[1] / 'scripts' / 'chibi.py'
spec = importlib.util.spec_from_file_location('chibi', PY)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class TestSkill(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.p = mod.init_character('Jinhsi', self.root)
        self.assertTrue(self.p.is_file())

    def tearDown(self): self.tmp.cleanup()

    def ready(self):
        c = mod.read_json(self.p)
        for k in mod.REQUIRED_IDENTITY: c['identity'][k] = f'Verificado: {k}'
        identity = self.p.parent / 'identity.png'
        Image.new('RGB', (1024,1024), '#fff0e9').save(identity)
        c['identity_images'] = ['identity.png']
        c['sources'] = [
            {'url': 'https://wutheringwaves.kurogames.com/a', 'what_was_verified':'Franja e cabelo'},
            {'url': 'https://wutheringwaves.kurogames.com/b', 'what_was_verified':'Roupa e acessórios'}
        ]
        mod.write_json(self.p,c)
        return c

    def test_requires_real_research_fields(self):
        self.assertTrue(mod.research_errors(mod.read_json(self.p),self.p))
        self.ready()
        self.assertEqual([],mod.research_errors(mod.read_json(self.p),self.p))

    def test_prompt_pair_and_corrections(self):
        c=self.ready()
        c['must_not_add']=['gold dragon halo']
        mod.write_json(self.p,c)
        a,b=mod.prompts_from_spec(self.p)
        self.assertIn('gold dragon halo',a.read_text())
        self.assertIn('Option A',a.read_text())
        self.assertIn('Option B',b.read_text())
        self.assertNotEqual(a.read_text(),b.read_text())

    def test_duplicate_pair_fails(self):
        c=self.ready()
        for v in ('a','b'):
            Image.new('RGB',(1024,1024),'white').save(self.p.parent/f'jinhsi-opcao-{v}.png')
        self.assertTrue(mod.validate_pair(self.p))

    def test_two_api_invocations_with_mock_and_visual_review_gate(self):
        self.ready()
        calls=[]
        class DummyImages:
            def edit(self,**kw):
                calls.append(kw)
                buf=BytesIO()
                Image.new('RGB',(1024,1024),('white' if len(calls)==1 else 'pink')).save(buf,'PNG')
                class Item: b64_json=base64.b64encode(buf.getvalue()).decode()
                class Resp: data=[Item()]
                return Resp()
        class DummyClient: images=DummyImages()
        outputs=mod.generate_from_spec(self.p,client=DummyClient())
        self.assertEqual(2,len(calls))
        self.assertEqual(2,len(outputs))
        self.assertEqual(8,len(calls[0]['image']))
        self.assertEqual([],mod.validate_pair(self.p))
        c=mod.read_json(self.p)
        self.assertEqual('pending_visual_review',c['status'])
        mod.approval(self.p,'Revisor de teste')
        self.assertEqual('approved',mod.read_json(self.p)['status'])

    def test_jinhsi_special_correction(self):
        c=mod.read_json(self.p)
        self.assertTrue(any('halo' in item for item in c['must_not_add']))
        self.assertTrue(any('volume lateral' in item for item in c['user_corrections']))

    def test_resume_after_second_image_failure(self):
        self.ready()
        calls=[]
        class TemporaryError(Exception): pass
        class FailOnce:
            def edit(self,**kw):
                calls.append(kw)
                if len(calls) == 2: raise TemporaryError('simulated network interruption')
                buffer=BytesIO(); Image.new('RGB',(1024,1024),'white').save(buffer,'PNG')
                class Item: b64_json=base64.b64encode(buffer.getvalue()).decode()
                class Resp: data=[Item()]
                return Resp()
        class Retry:
            def edit(self,**kw):
                calls.append(kw)
                buffer=BytesIO(); Image.new('RGB',(1024,1024),'pink').save(buffer,'PNG')
                class Item: b64_json=base64.b64encode(buffer.getvalue()).decode()
                class Resp: data=[Item()]
                return Resp()
        class C: pass
        c=C(); c.images=FailOnce()
        with self.assertRaises(TemporaryError): mod.generate_from_spec(self.p,client=c)
        self.assertEqual('partial_generation',mod.read_json(self.p)['status'])
        c.images=Retry()
        mod.generate_from_spec(self.p,client=c,resume=True)
        self.assertEqual(3,len(calls))
        self.assertEqual('pending_visual_review',mod.read_json(self.p)['status'])
        self.assertEqual([],mod.validate_pair(self.p))

    def test_install_in_empty_project(self):
        repo=self.root/'repo';repo.mkdir()
        target=mod.install(repo)
        self.assertTrue((target/'SKILL.md').is_file())
        self.assertTrue((target/'assets/style-references/reference-07.png').exists())
        with self.assertRaises(FileExistsError): mod.install(repo)

if __name__=='__main__': unittest.main()
