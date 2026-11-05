import importlib.util
from pathlib import Path

_ruta = Path(__file__).parent / "app.py"
_spec = importlib.util.spec_from_file_location("promohunt_flask", _ruta)
_modulo = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_modulo)

app = _modulo.app
