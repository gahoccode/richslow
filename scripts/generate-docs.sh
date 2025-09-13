#!/bin/bash

# Documentation Generation and Validation Script
# This script automates documentation generation and validation for RichSlow

set -e

echo "🚀 Starting documentation generation and validation..."

# Create necessary directories
mkdir -p docs/api
mkdir -p docs/dependencies
mkdir -p docs/diagrams

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate documentation
validate_documentation() {
    echo "📋 Validating documentation..."
    
    # Check for broken markdown links (requires markdown-link-check)
    if command_exists markdown-link-check; then
        echo "  🔍 Checking markdown links..."
        find docs/ -name "*.md" -exec markdown-link-check {} \; || echo "  ⚠️  Some link checks failed"
    else
        echo "  ⚠️  markdown-link-check not installed, skipping link validation"
    fi
    
    # Check for broken code references
    echo "  🔍 Checking code references..."
    find docs/ -name "*.md" -exec grep -n "app/" {} \; | while read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        ref=$(echo "$line" | cut -d: -f3-)
        if [[ "$ref" == *.py ]] && [[ ! -f "$ref" ]]; then
            echo "  ❌ Broken code reference in $file: $ref"
        fi
    done
    
    echo "  ✅ Documentation validation complete"
}

# Function to generate API documentation
generate_api_docs() {
    echo "📚 Generating API documentation..."
    
    # Start server in background
    echo "  🚀 Starting server..."
    uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "  ⏳ Waiting for server to start..."
    sleep 5
    
    # Fetch OpenAPI specification
    echo "  📥 Fetching OpenAPI specification..."
    if curl -s http://localhost:8000/openapi.json > docs/api/openapi.json; then
        echo "  ✅ OpenAPI specification fetched"
    else
        echo "  ❌ Failed to fetch OpenAPI specification"
        kill $SERVER_PID 2>/dev/null || true
        return 1
    fi
    
    # Generate HTML documentation with redoc if available
    if command_exists npx && npx redoc-cli --version >/dev/null 2>&1; then
        echo "  📄 Generating HTML documentation..."
        npx redoc-cli bundle docs/api/openapi.json --output docs/api/index.html
        echo "  ✅ HTML documentation generated"
    else
        echo "  ⚠️  redoc-cli not available, skipping HTML generation"
    fi
    
    # Stop server
    echo "  🛑 Stopping server..."
    kill $SERVER_PID 2>/dev/null || true
    
    echo "  ✅ API documentation generation complete"
}

# Function to generate dependency documentation
generate_dependency_docs() {
    echo "📦 Generating dependency documentation..."
    
    # Generate dependency tree
    echo "  🌳 Generating dependency tree..."
    uv tree > docs/dependencies/current.txt 2>/dev/null || echo "  ⚠️  Failed to generate dependency tree"
    
    # Generate security audit if uv pip-audit is available
    if command_exists uv && uv pip-audit --help >/dev/null 2>&1; then
        echo "  🔒 Running security audit..."
        uv pip-audit > docs/dependencies/security-audit.txt 2>/dev/null || echo "  ⚠️  Security audit failed"
    else
        echo "  ⚠️  uv pip-audit not available, skipping security audit"
    fi
    
    # Generate versions documentation
    echo "  📋 Generating versions documentation..."
    python3 << 'EOF'
import sys
from pathlib import Path

def generate_versions_doc():
    try:
        # Read pyproject.toml
        pyproject_path = Path('pyproject.toml')
        if not pyproject_path.exists():
            print("  ⚠️  pyproject.toml not found")
            return
            
        with open(pyproject_path) as f:
            content = f.read()
        
        # Simple parsing for dependencies
        deps = []
        dev_deps = []
        current_section = None
        
        for line in content.split('\n'):
            line = line.strip()
            if line.startswith('dependencies = ['):
                current_section = 'deps'
            elif line.startswith('dev = ['):
                current_section = 'dev_deps'
            elif line.startswith(']') and current_section:
                current_section = None
            elif current_section and line.startswith('"') and line.endswith('",'):
                dep = line.strip('",')
                if current_section == 'deps':
                    deps.append(dep)
                elif current_section == 'dev_deps':
                    dev_deps.append(dep)
        
        # Write versions documentation
        with open('docs/dependencies/versions.md', 'w') as f:
            f.write('# Dependency Versions\n\n')
            f.write('## Production Dependencies\n\n')
            for dep in deps:
                f.write(f'- {dep}\n')
            
            f.write('\n## Development Dependencies\n\n')
            for dep in dev_deps:
                f.write(f'- {dep}\n')
            
            f.write('\n*Generated on: ' + str(Path('pyproject.toml').stat().st_mtime) + '*\n')
        
        print("  ✅ Versions documentation generated")
    except Exception as e:
        print(f"  ❌ Failed to generate versions documentation: {e}")

generate_versions_doc()
EOF
    
    echo "  ✅ Dependency documentation generation complete"
}

# Function to generate architecture overview
generate_architecture_overview() {
    echo "🏗️  Generating architecture overview..."
    
    python3 << 'EOF'
import ast
import os
from pathlib import Path
from datetime import datetime

def analyze_codebase():
    structure = {
        'modules': [],
        'endpoints': [],
        'schemas': [],
        'services': [],
        'routes': []
    }
    
    # Analyze main application
    app_path = Path('app')
    if not app_path.exists():
        print("  ⚠️  app directory not found")
        return structure
    
    for py_file in app_path.rglob('*.py'):
        try:
            with open(py_file, 'r', encoding='utf-8') as f:
                tree = ast.parse(f.read())
            
            relative_path = str(py_file.relative_to('.'))
            structure['modules'].append(relative_path)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    # Check if it's an API endpoint
                    if any(decorator.id in ['get', 'post', 'put', 'delete'] 
                           for decorator in node.decorator_list 
                           if isinstance(decorator, ast.Name)):
                        structure['endpoints'].append({
                            'name': node.name,
                            'file': relative_path,
                            'line': node.lineno
                        })
                    elif 'route' in node.name or 'endpoint' in node.name:
                        structure['routes'].append({
                            'name': node.name,
                            'file': relative_path,
                            'line': node.lineno
                        })
                
                elif isinstance(node, ast.ClassDef):
                    if 'Schema' in node.name or 'Data' in node.name or 'Response' in node.name:
                        structure['schemas'].append({
                            'name': node.name,
                            'file': relative_path,
                            'line': node.lineno
                        })
                    elif 'Service' in node.name:
                        structure['services'].append({
                            'name': node.name,
                            'file': relative_path,
                            'line': node.lineno
                        })
                        
        except Exception as e:
            print(f"  ⚠️  Error analyzing {py_file}: {e}")
    
    return structure

def generate_architecture_doc(structure):
    with open('docs/architecture/overview.md', 'w') as f:
        f.write('# Architecture Overview\n\n')
        f.write('*Generated on: ' + datetime.now().isoformat() + '*\n\n')
        
        f.write('## Project Structure\n\n')
        f.write('```\n')
        for module in structure['modules']:
            f.write(f'{module}\n')
        f.write('```\n\n')
        
        f.write('## API Endpoints (' + str(len(structure['endpoints'])) + ')\n\n')
        for endpoint in structure['endpoints']:
            f.write(f"- **{endpoint['name']}** ({endpoint['file']}:{endpoint['line']})\n")
        f.write('\n')
        
        f.write('## Data Models (' + str(len(structure['schemas'])) + ')\n\n')
        for schema in structure['schemas']:
            f.write(f"- **{schema['name']}** ({schema['file']}:{schema['line']})\n")
        f.write('\n')
        
        f.write('## Services (' + str(len(structure['services'])) + ')\n\n')
        for service in structure['services']:
            f.write(f"- **{service['name']}** ({service['file']}:{service['line']})\n")
        f.write('\n')
        
        f.write('## Routes (' + str(len(structure['routes'])) + ')\n\n')
        for route in structure['routes']:
            f.write(f"- **{route['name']}** ({route['file']}:{route['line']})\n")

print("  🔍 Analyzing codebase...")
structure = analyze_codebase()

print("  📄 Generating architecture documentation...")
generate_architecture_doc(structure)

print("  ✅ Architecture overview generated")
EOF
    
    echo "  ✅ Architecture overview generation complete"
}

# Function to run linting and formatting
run_quality_checks() {
    echo "🔍 Running code quality checks..."
    
    # Run ruff check
    if command_exists uv; then
        echo "  📋 Running ruff check..."
        uv run ruff check app/ || echo "  ⚠️  Ruff found some issues"
    fi
    
    # Run ruff format
    if command_exists uv; then
        echo "  ✨ Running ruff format..."
        uv run ruff format app/ --check || echo "  ⚠️  Code formatting issues found"
    fi
    
    echo "  ✅ Code quality checks complete"
}

# Function to generate documentation index
generate_index() {
    echo "📚 Generating documentation index..."
    
    cat > docs/README.md << 'EOF'
# RichSlow Documentation

Welcome to the RichSlow project documentation. This documentation provides comprehensive information about the Vietnamese stock market financial analysis application.

## Quick Start

- [Architecture Overview](architecture/README.md) - High-level system architecture
- [API Documentation](api/index.html) - Interactive API documentation
- [Getting Started](../README.md) - Project setup and development

## Documentation Sections

### Architecture Documentation
- [Architecture Overview](architecture/README.md) - Comprehensive system architecture
- [Architecture Decision Records](architecture/adr/README.md) - Key architectural decisions
- [C4 Model Diagrams](architecture/README.md#c4-model-architecture) - Visual architecture diagrams
- [Data Architecture](architecture/README.md#data-architecture) - Data models and flow

### API Documentation
- [Interactive API Docs](api/index.html) - Browseable API documentation
- [OpenAPI Specification](api/openapi.json) - Machine-readable API specification
- [API Endpoints](architecture/README.md#level-2-container-diagram) - Available API endpoints

### Development Documentation
- [Setup Instructions](../README.md) - How to set up development environment
- [Code Quality](../CLAUDE.md#code-quality) - Linting and formatting standards
- [Dependencies](dependencies/versions.md) - Project dependencies and versions

### Operations Documentation
- [Deployment](architecture/README.md#deployment-architecture) - Deployment and operations
- [Monitoring](architecture/README.md#quality-attributes) - Monitoring and observability
- [Security](architecture/README.md#security-architecture) - Security considerations

## Contributing to Documentation

See [Documentation Maintenance](architecture/maintenance.md) for information about maintaining and improving documentation.

## Quick Links

- [Source Code](https://github.com/your-username/richslow)
- [Issues](https://github.com/your-username/richslow/issues)
- [API Documentation](api/index.html)
- [Architecture Overview](architecture/README.md)

*Last updated: $(date)*
EOF
    
    echo "  ✅ Documentation index generated"
}

# Main execution
echo ""
echo "📋 Documentation Generation Pipeline"
echo "=================================="

# Run all generation steps
generate_api_docs
generate_dependency_docs
generate_architecture_overview
run_quality_checks
validate_documentation
generate_index

echo ""
echo "✅ Documentation generation and validation complete!"
echo ""
echo "📚 Generated Documentation:"
echo "   - API Documentation: docs/api/"
echo "   - Dependencies: docs/dependencies/"
echo "   - Architecture: docs/architecture/"
echo "   - Main Index: docs/README.md"
echo ""
echo "🔗 Quick Access:"
echo "   - API Docs: file://$(pwd)/docs/api/index.html"
echo "   - Architecture: file://$(pwd)/docs/architecture/README.md"
echo "   - All Docs: file://$(pwd)/docs/README.md"
echo ""
echo "💡 Next Steps:"
echo "   1. Review generated documentation"
echo "   2. Check for any validation warnings"
echo "   3. Update any manual documentation as needed"
echo "   4. Commit documentation changes"
echo ""