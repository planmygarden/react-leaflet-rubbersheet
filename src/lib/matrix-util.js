import L from 'leaflet'

class MatrixUtil {
  // Compute the adjugate of m
  static adj(m) {
    return [
      m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
      m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
      m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
    ];
  }

  // multiply two 3*3 matrices
  static multmm(a, b) {
    var c = [],
      i;

    for (i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var cij = 0;
        for (var k = 0; k < 3; k++) {
          cij += a[3*i + k]*b[3*k + j];
        }
        c[3*i + j] = cij;
      }
    }
    return c;
  }

  static getMatrixString(m) {
    var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d,
    /*
       * Since matrix3d takes a 4*4 matrix, we add in an empty row and column, which act as the identity on the z-axis.
       * See:
       *     http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
       *     https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#M.C3.B6bius'_homogeneous_coordinates_in_projective_geometry
       */
    matrix = [
      m[0], m[3], 0, m[6],
      m[1], m[4], 0, m[7],
         0,    0, 1,    0,
      m[2], m[5], 0, m[8]
    ],

    str = is3d ? 'matrix3d(' + matrix.join(',') + ')' : '';

    if (!is3d) {
      console.log('Your browser must support 3D CSS transforms in order to use LeafletRubbersheet.');
    }

    return str;
  };

  // multiply a 3*3 matrix and a 3-vector
  static multmv(m, v) {
    return [
      m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
      m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
      m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
    ];
  }

  // multiply a scalar and a 3*3 matrix
  static multsm(s, m) {
    var matrix = [];

    for (var i = 0, l = m.length; i < l; i++) {
      matrix.push(s*m[i]);
    }

    return matrix;
  }

  static basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
    var m = [
        x1, x2, x3,
        y1, y2, y3,
        1,  1,  1
      ],
      v = MatrixUtil.multmv(MatrixUtil.adj(m), [x4, y4, 1]);

    return MatrixUtil.multmm(m, [
      v[0], 0, 0,
      0, v[1], 0,
      0, 0, v[2]
    ]);
  }

  static project(m, x, y) {
    var v = MatrixUtil.multmv(m, [x, y, 1]);
    return [v[0]/v[2], v[1]/v[2]];
  }

  static general2DProjection(
    x1s, y1s, x1d, y1d,
    x2s, y2s, x2d, y2d,
    x3s, y3s, x3d, y3d,
    x4s, y4s, x4d, y4d
  ) {
    var s = MatrixUtil.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s),
      d = MatrixUtil.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d),
      m = MatrixUtil.multmm(d, MatrixUtil.adj(s));

    /*
     *  Normalize to the unique matrix with m[8] == 1.
     *   See: http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
     */
    return MatrixUtil.multsm(1/m[8], m);
  }
}

export default MatrixUtil;
